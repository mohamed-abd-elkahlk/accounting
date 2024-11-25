use futures::TryStreamExt;
use mongodb::bson::{self, datetime::DateTime as MongoDateTime, doc, Bson, Document};
use tauri::State;
use tokio::sync::Mutex;

use crate::{
    db::MongoDbState,
    schema::{
        collections::Collection,
        error::{AppResult, ErrorResponse},
        invoice_schema::{Invoice, NewInvoice},
    },
    utils::parse_object_id,
};

#[tauri::command]
pub async fn create_invoice(
    new_invoice: NewInvoice,
    db: State<'_, Mutex<MongoDbState>>,
) -> AppResult<Invoice> {
    let db = db.lock().await;
    let collection = db.get_collection::<Document>(Collection::Invoice);

    let mut invoice = Invoice {
        id: None,
        client_id: new_invoice.client_id,
        goods: new_invoice.goods,
        created_at: MongoDateTime::now(),
        updated_at: MongoDateTime::now(),
    };

    let doc = bson::to_document(&invoice).map_err(|e| {
        ErrorResponse::new(400, "Failed to serialize invoice data", Some(e.to_string()))
    })?;

    let result = collection.insert_one(doc).await.map_err(|e| {
        ErrorResponse::new(
            500,
            "Failed to insert invoice into database",
            Some(e.to_string()),
        )
    })?;

    let inserted_id = match result.inserted_id {
        Bson::ObjectId(id) => id,
        _ => return Err(ErrorResponse::new(500, "Invalid inserted ID", None)),
    };

    invoice.id = Some(inserted_id);
    Ok(invoice)
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
pub async fn get_all_invoices(db: State<'_, Mutex<MongoDbState>>) -> AppResult<Vec<Invoice>> {
    let db = db.lock().await;
    let collection = db.get_collection::<Document>(Collection::Invoice);

    // Define the aggregation pipeline
    let pipeline = vec![
        doc! {
            "$lookup": {
                "from": "clients",
                "localField": "client_id",
                "foreignField": "_id",
                "as": "client"
            }
        },
        doc! {
            "$unwind": "$client"
        },
        doc! {
            "$lookup": {
                "from": "products",
                "localField": "goods",
                "foreignField": "_id",
                "as": "goods"
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
        let invoice: Invoice = bson::from_document(doc).map_err(|e| {
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
) -> AppResult<Invoice> {
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
        let invoice: Invoice = bson::from_document(doc).map_err(|e| {
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
