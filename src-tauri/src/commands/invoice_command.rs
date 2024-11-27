use futures::TryStreamExt;
use mongodb::bson::{self, datetime::DateTime as MongoDateTime, doc, Document};
use tauri::State;
use tokio::sync::Mutex;

use crate::{
    db::MongoDbState,
    schema::{
        collections::Collection,
        error::{AppResult, ErrorResponse},
        invoice_schema::{Invoice, InvoiceDetails, NewInvoice},
    },
    utils::parse_object_id,
};

#[tauri::command]
pub async fn create_invoice(
    new_invoice: NewInvoice,
    db: State<'_, Mutex<MongoDbState>>,
) -> AppResult<()> {
    let db = db.lock().await;

    // Start a new session
    let mut session = db
        .start_session()
        .await
        .map_err(|e| ErrorResponse::new(e.code, &e.message, e.details))?;

    // Start a transaction
    session.start_transaction().await.map_err(|e| {
        ErrorResponse::new(
            500,
            "Failed to start MongoDB transaction.",
            Some(e.to_string()),
        )
    })?;

    let invoice_collection = db.get_collection::<Document>(Collection::Invoice);
    let product_collection = db.get_collection::<Document>(Collection::Product);

    // Prepare the invoice document
    let invoice = Invoice {
        id: None,
        client_id: new_invoice.client_id.clone(),
        goods: new_invoice.goods.clone(),
        created_at: MongoDateTime::now(),
        updated_at: MongoDateTime::now(),
    };

    let doc = match bson::to_document(&invoice) {
        Ok(doc) => doc,
        Err(e) => {
            session.abort_transaction().await.ok();
            return Err(ErrorResponse::new(
                500,
                "Failed to serialize invoice.",
                Some(e.to_string()),
            ));
        }
    };

    // Step 1: Insert the new invoice within the session
    if let Err(e) = invoice_collection
        .insert_one(doc)
        .session(&mut session)
        .await
    {
        session.abort_transaction().await.ok();
        return Err(ErrorResponse::new(
            500,
            "Failed to insert invoice into database.",
            Some(e.to_string()),
        ));
    }
    // Step 2: Update the product quantities within the session
    for goods_item in &new_invoice.goods {
        let filter = doc! { "_id": goods_item.product_id };

        // Check the stock of the product
        let product = match product_collection
            .find_one(filter.clone())
            .session(&mut session)
            .await
        {
            Ok(Some(product)) => product,
            Ok(None) => {
                session.abort_transaction().await.ok();
                return Err(ErrorResponse::new(
                    400,
                    format!("Product not found with ID: {}", goods_item.product_id).as_str(),
                    None,
                ));
            }
            Err(e) => {
                session.abort_transaction().await.ok();
                return Err(ErrorResponse::new(
                    500,
                    "Failed to fetch product details.",
                    Some(e.to_string()),
                ));
            }
        };

        // Validate stock
        let current_stock: i64 = product.get_i64("stock").unwrap_or_else(|_| 0); // Default to 0 if missing or invalid

        if current_stock < goods_item.quantity as i64 {
            session.abort_transaction().await.ok();
            return Err(ErrorResponse::new(
                400,
                "Insufficient stock for product.",
                Some(format!(
                    "Product ID: {}, Available Stock: {}, Requested: {}",
                    goods_item.product_id, current_stock, goods_item.quantity
                )),
            ));
        }

        // Decrement stock
        let update = doc! { "$inc": { "stock": -(goods_item.quantity as i32) } };

        if let Err(e) = product_collection
            .update_one(filter, update)
            .session(&mut session)
            .await
        {
            session.abort_transaction().await.ok();
            return Err(ErrorResponse::new(
                500,
                "Failed to update product quantity.",
                Some(format!(
                    "Product ID: {}. Error: {}",
                    goods_item.product_id, e
                )),
            ));
        }
    }

    // Commit the transaction
    session.commit_transaction().await.map_err(|e| {
        ErrorResponse::new(
            500,
            "Failed to commit MongoDB transaction.",
            Some(e.to_string()),
        )
    })?;

    Ok(())
}

#[tauri::command]
pub async fn delete_invoice(
    invoice_id: String,
    db: State<'_, Mutex<MongoDbState>>,
) -> AppResult<String> {
    let db = db.lock().await;
    let collection = db.get_collection::<Invoice>(Collection::Invoice);

    let id = parse_object_id(&invoice_id, "Invoice")?;

    let result = collection
        .delete_one(doc! { "_id": id })
        .await
        .map_err(|e| ErrorResponse::new(500, "Failed to delete invoice", Some(e.to_string())))?;

    if result.deleted_count == 1 {
        Ok(format!(
            "Invoice with ID {} deleted successfully",
            invoice_id
        ))
    } else {
        Err(ErrorResponse::new(404, "Invoice not found", None))
    }
}

/// Fetch all invoices with populated `Client` and `Product` data
#[tauri::command]
pub async fn get_all_invoices(
    db: State<'_, Mutex<MongoDbState>>,
) -> AppResult<Vec<InvoiceDetails>> {
    let db = db.lock().await;
    let collection = db.get_collection::<Document>(Collection::Invoice);

    // Define the aggregation pipeline
    let pipeline = [
        doc! {
            "$lookup": doc! {
                "from": "clients",
                "localField": "clientId",
                "foreignField": "_id",
                "as": "client"
            }
        },
        doc! {
            "$unwind": doc! {
                "path": "$client"
            }
        },
        doc! {
            "$unwind": doc! {
                "path": "$goods"
            }
        },
        doc! {
            "$lookup": doc! {
                "from": "products",
                "localField": "goods.productId",
                "foreignField": "_id",
                "as": "prod"
            }
        },
        doc! {
            "$unwind": doc! {
                "path": "$prod"
            }
        },
        doc! {
            "$addFields": doc! {
                "totalPrice": doc! {
                    "$multiply": [
                        "$prod.price",
                        "$goods.quantity"
                    ]
                }
            }
        },
        doc! {
            "$group": doc! {
                "_id": "$_id",
                "client": doc! {
                    "$first": "$client"
                },
                "goods": doc! {
                    "$push": "$prod"
                },
                "total": doc! {
                    "$sum": "$totalPrice"
                },
                "created_at": doc! {
                    "$first": "$created_at"
                },
                "updated_at": doc! {
                    "$first": "$updated_at"
                }
            }
        },
    ];

    // Execute the aggregation pipeline
    let mut cursor = collection
        .aggregate(pipeline)
        .await
        .map_err(|e| ErrorResponse::new(500, "Failed to fetch invoices", Some(e.to_string())))?;

    let mut invoices = Vec::new();

    while let Some(doc) = cursor
        .try_next()
        .await
        .map_err(|e| ErrorResponse::new(500, "Failed to parse invoice data", Some(e.to_string())))?
    {
        let invoice: InvoiceDetails = bson::from_document(doc).map_err(|e| {
            ErrorResponse::new(
                500,
                "Failed to deserialize invoice data",
                Some(e.to_string()),
            )
        })?;
        invoices.push(invoice);
    }

    Ok(invoices)
}

/// Fetch a single invoice by ID, using aggregation to populate `Client` and `Product` data
#[tauri::command]
pub async fn get_invoice_by_id(
    invoice_id: String,
    db: State<'_, Mutex<MongoDbState>>,
) -> AppResult<InvoiceDetails> {
    let db = db.lock().await;
    let collection = db.get_collection::<Document>(Collection::Invoice);

    // Parse the invoice ID
    let id = parse_object_id(&invoice_id, "Invoice")?;

    // Define the aggregation pipeline
    let pipeline = vec![
        doc! {
            "$match": { "_id": id }
        },
        doc! {
            "$lookup": {
                "from": "clients", // Collection storing client data
                "localField": "client_id", // Field in Invoice
                "foreignField": "_id", // Field in Client
                "as": "client" // Result will be added as `client`
            }
        },
        doc! {
            "$unwind": "$client" // Unwind the populated client field (optional)
        },
        doc! {
            "$lookup": {
                "from": "products", // Collection storing product data
                "localField": "goods", // Field in Invoice
                "foreignField": "_id", // Field in Product
                "as": "goods" // Result will be added as `goods`
            }
        },
    ];

    // Execute the aggregation pipeline
    let mut cursor = collection
        .aggregate(pipeline)
        .await
        .map_err(|e| ErrorResponse::new(500, "Failed to fetch invoice", Some(e.to_string())))?;

    // Get the first result
    if let Some(doc) = cursor
        .try_next()
        .await
        .map_err(|e| ErrorResponse::new(500, "Failed to parse invoice data", Some(e.to_string())))?
    {
        let invoice: InvoiceDetails = bson::from_document(doc).map_err(|e| {
            ErrorResponse::new(
                500,
                "Failed to deserialize invoice data",
                Some(e.to_string()),
            )
        })?;
        Ok(invoice)
    } else {
        Err(ErrorResponse::new(
            404,
            "Invoice not found",
            Some("No invoice matches the given ID".to_string()),
        ))
    }
}
#[tauri::command]
pub async fn update_invoice(
    invoice_id: String,
    updated_fields: Document,
    db: State<'_, Mutex<MongoDbState>>,
) -> AppResult<Invoice> {
    let db = db.lock().await;
    let collection = db.get_collection::<Invoice>(Collection::Invoice);

    let id = parse_object_id(&invoice_id, "Invoice")?;

    let mut updated_fields = updated_fields.clone();
    updated_fields.insert("updated_at", MongoDateTime::now());

    let update_doc = doc! {
        "$set": updated_fields
    };

    let result = collection
        .update_one(doc! { "_id": id }, update_doc)
        .await
        .map_err(|e| {
            ErrorResponse::new(
                500,
                "Failed to update invoice in the database",
                Some(e.to_string()),
            )
        })?;

    if result.matched_count == 0 {
        return Err(ErrorResponse::new(
            404,
            "Invoice not found",
            Some("No invoice matches the given ID".to_string()),
        ));
    }

    let updated_invoice = collection
        .find_one(doc! { "_id": id })
        .await
        .map_err(|e| {
            ErrorResponse::new(500, "Failed to fetch updated invoice", Some(e.to_string()))
        })?
        .ok_or_else(|| {
            ErrorResponse::new(
                404,
                "Invoice not found",
                Some("No invoice found after update".to_string()),
            )
        })?;

    Ok(updated_invoice)
}
