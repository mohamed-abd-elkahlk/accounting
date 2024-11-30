use std::{borrow::BorrowMut, collections::HashMap};

use futures::StreamExt;
use mongodb::bson::{self, doc, oid::ObjectId, DateTime, Document};
use tauri::State;
use tokio::sync::Mutex;

use crate::{
    db::MongoDbState,
    schema::{
        collections::Collection,
        error::{AppResult, ErrorResponse},
        invoice_schema::{Goods, Invoice, NewInvoice, Status},
        product_schema::Product,
    },
    utils::parse_object_id,
};

#[tauri::command]
pub async fn create_invoice(
    new_invoice: NewInvoice,
    db: State<'_, Mutex<MongoDbState>>,
) -> AppResult<()> {
    let db = db.lock().await;
    let invoice_collection = db.get_collection::<Document>(Collection::Invoice);
    let product_collection = db.get_collection::<Document>(Collection::Product);

    // Step 1: Start a transaction
    let mut session = db.start_session().await?;
    session.start_transaction().await.map_err(|e| {
        ErrorResponse::new(
            500,
            "Failed to start MongoDB transaction.",
            Some(e.to_string()),
        )
    })?;

    let mut total_price = 0.0;

    // Step 2: Validate and update stock for goods
    for goods in &new_invoice.goods {
        let product_id = &goods.product_id;

        // Fetch the product
        let product_doc = match product_collection
            .find_one(doc! { "_id": product_id })
            .session(&mut session)
            .await
        {
            Ok(doc) => Ok(doc.unwrap()),
            Err(e) => {
                session.abort_transaction().await.ok();
                Err(ErrorResponse::new(
                    404,
                    "Product not found",
                    Some(e.to_string()),
                ))
            }
        }?;

        let stock: i64 = product_doc
            .get_i64("stock")
            .map_err(|e| ErrorResponse::new(500, "Invalid stock data.", Some(e.to_string())))?;
        if stock < goods.quantity as i64 {
            session.abort_transaction().await.ok();
            return Err(ErrorResponse::new(
                400,
                format!("Insufficient stock for product: {}", goods.name).as_str(),
                None,
            ));
        }

        // Update stock
        let update_result = product_collection
            .update_one(
                doc! { "_id": product_id },
                doc! { "$inc": { "stock": -(goods.quantity as i32) } },
            )
            .session(&mut session)
            .await;

        match update_result {
            Ok(_) => Ok(()), // Returns `Result<(), SomeErrorType>`
            Err(e) => {
                session.abort_transaction().await.ok();
                Err(ErrorResponse::new(
                    400,
                    &format!("Failed to update Product with ID: {}", product_id),
                    Some(e.to_string()),
                )) // Ensure consistent `Result` type
            }
        }?;
        // Calculate total price
        total_price += goods.price * goods.quantity as f64;
    }
    // Check if total price greater than total paid
    if total_price < new_invoice.total_paid {
        session.abort_transaction().await.ok();
        return Err(ErrorResponse::new(
            400,
            "Total paid must be less than or equial total price",
            None,
        ));
    }
    // Step 3: Prepare the invoice
    let invoice = Invoice {
        id: None,
        client_id: new_invoice.client_id.clone(),
        goods: new_invoice.goods.clone(),
        total_paid: new_invoice.total_paid,
        status: if new_invoice.total_paid >= total_price {
            Status::Paid
        } else if new_invoice.total_paid > 0.0 {
            Status::PartialPaid
        } else {
            Status::UnPaid
        },
        total_price,
        created_at: DateTime::now(),
        updated_at: DateTime::now(),
    };

    // Insert the invoice
    let insert_result = invoice_collection
        .insert_one(
            bson::to_document(&invoice)
                .map_err(|e| ErrorResponse::new(500, &e.to_string(), None))?,
        )
        .session(&mut session)
        .await;

    match insert_result {
        Ok(res) => {
            println!("{:?}", res)
        }
        Err(e) => {
            session.abort_transaction().await.ok();
            return Err(ErrorResponse::new(
                500,
                &format!("Failed to insert invoice: {}", e),
                None,
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
pub async fn list_all_invoices(db: State<'_, Mutex<MongoDbState>>) -> AppResult<Vec<Invoice>> {
    let db = db.lock().await;
    let invoice_collection = db.get_collection::<Document>(Collection::Invoice);
    let cursor = invoice_collection.find(doc! {}).await.map_err(|e| {
        ErrorResponse::new(500, "Faild to serialize invoice data", Some(e.to_string()))
    })?;

    let invoices: Vec<Invoice> = {
        let mut invoice_vec = Vec::new();
        let mut stream = cursor;

        while let Some(result) = stream.next().await {
            match result {
                Ok(doc) => match bson::from_document::<Invoice>(doc) {
                    Ok(invoice) => invoice_vec.push(invoice), // Add valid invoices to the vector
                    Err(e) => {
                        return Err(ErrorResponse::new(
                            500,
                            "Failed to serialize invoice data",
                            Some(e.to_string()),
                        ));
                    }
                },
                Err(e) => {
                    return Err(ErrorResponse::new(
                        500,
                        "Failed to retrieve a document from the cursor",
                        Some(e.to_string()),
                    ));
                }
            }
        }

        invoice_vec
    };
    Ok(invoices)
}

#[tauri::command]
pub async fn get_invoice_by_id(
    invoice_id: String,
    db: State<'_, Mutex<MongoDbState>>,
) -> AppResult<Invoice> {
    let db = db.lock().await;
    let invoice_collection = db.get_collection::<Invoice>(Collection::Invoice);
    let id = parse_object_id(&invoice_id, "Invoice")?;
    let invoice = match invoice_collection.find_one(doc! {"_id":id}).await {
        Ok(doc) => Ok(doc.unwrap()),
        Err(e) => Err(ErrorResponse::new(
            404,
            &format!("invoice wiht this ID: {invoice_id}"),
            Some(e.to_string()),
        )),
    }?;

    Ok(invoice)
}

#[tauri::command]
pub async fn update_invoice_by_id(
    invoice_id: String,
    mut updated_invoice_doc: Document, // Accept MongoDB's Document type
    db: State<'_, Mutex<MongoDbState>>,
) -> AppResult<()> {
    let db = db.lock().await;

    // Start a session
    let mut session =
        db.client.start_session().await.map_err(|e| {
            ErrorResponse::new(500, &format!("Failed to start session: {}", e), None)
        })?;

    session.start_transaction().await.map_err(|e| {
        ErrorResponse::new(500, &format!("Failed to start transaction: {}", e), None)
    })?;

    let invoice_collection = db.get_collection::<Invoice>(Collection::Invoice);
    let product_collection = db.get_collection::<Product>(Collection::Product);

    // Parse the invoice ID to ObjectId
    let id = parse_object_id(&invoice_id, "Invoice")?;

    // Fetch the existing invoice
    let existing_invoice = invoice_collection
        .find_one(doc! { "_id": id })
        .session(&mut session)
        .await
        .map_err(|e| ErrorResponse::new(400, &e.to_string(), None))?
        .ok_or_else(|| ErrorResponse::new(404, "Invoice not found", None))?;

    updated_invoice_doc.insert("status", Status::UnPaid.to_string());
    updated_invoice_doc.insert("totalPrice", 0.0);
    updated_invoice_doc.insert("created_at", DateTime::now());
    updated_invoice_doc.insert("updated_at", DateTime::now());
    // Deserialize the updated_invoice_doc into an Invoice struct
    let updated_invoice: Invoice = match bson::from_document(updated_invoice_doc) {
        Ok(doc) => doc,
        Err(e) => {
            session.abort_transaction().await.ok();
            return Err(ErrorResponse::new(
                400,
                &format!("Invalid invoice data: {}", e),
                None,
            ))?;
        }
    };

    // Compare goods
    let existing_goods_map: HashMap<ObjectId, Goods> = existing_invoice
        .goods
        .iter()
        .map(|g| (g.product_id.clone(), g.clone()))
        .collect::<HashMap<_, _>>();
    let updated_goods_map = updated_invoice
        .goods
        .iter()
        .map(|g| (g.product_id.clone(), g.clone()))
        .collect::<HashMap<_, _>>();

    // Update product stock
    for (product_id, existing_good) in &existing_goods_map {
        if !updated_goods_map.contains_key(product_id) {
            // Removed product: Increase stock
            match product_collection
                .find_one_and_update(
                    doc! { "_id": product_id },
                    doc! { "$inc": { "stock": existing_good.quantity } },
                )
                .session(&mut session)
                .await
            {
                Ok(_) => (),
                Err(e) => {
                    session.abort_transaction().await.ok();

                    return Err(ErrorResponse::new(
                        500,
                        "Faild to update invoice",
                        Some(e.to_string()),
                    ))?;
                }
            }
        }
    }

    for (product_id, updated_good) in &updated_goods_map {
        if let Some(existing_good) = existing_goods_map.get(product_id) {
            // Updated product: Adjust stock
            let quantity_diff = updated_good.quantity - existing_good.quantity;
            match product_collection
                .find_one_and_update(
                    doc! { "_id": product_id },
                    doc! { "$inc": { "stock": -quantity_diff } },
                )
                .session(&mut session)
                .await
            {
                Ok(_) => (),
                Err(e) => {
                    session.abort_transaction().await.ok();
                    return Err(ErrorResponse::new(500, &e.to_string(), None))?;
                }
            }
        } else {
            // New product: Decrease stock
            match product_collection
                .find_one_and_update(
                    doc! { "_id": product_id },
                    doc! { "$inc": { "stock": -updated_good.quantity } },
                )
                .session(&mut session)
                .await
            {
                Ok(_) => (),
                Err(e) => {
                    session.abort_transaction().await.ok();
                    return Err(ErrorResponse::new(500, &e.to_string(), None))?;
                }
            }
        }
    }

    // Calculate total price
    let total_price: f64 = updated_invoice
        .goods
        .iter()
        .map(|g| g.price * g.quantity as f64)
        .sum();
    // Check if total price greater than total paid
    if total_price < updated_invoice.total_paid {
        session.abort_transaction().await.ok();
        return Err(ErrorResponse::new(
            400,
            "Total paid must be less than or equial total price",
            None,
        ));
    }

    // Determine the status
    let status = if updated_invoice.total_paid >= total_price {
        Status::Paid
    } else if updated_invoice.total_paid > 0.0 {
        Status::PartialPaid
    } else {
        Status::UnPaid
    };

    // Update the invoice
    let updated_invoice = Invoice {
        total_price,
        status,
        updated_at: DateTime::now(),
        ..updated_invoice
    };

    match invoice_collection
        .find_one_and_replace(doc! { "_id": id }, updated_invoice)
        .session(&mut session)
        .await
    {
        Ok(_) => (),
        Err(e) => {
            session.abort_transaction().await.ok();
            return Err(ErrorResponse::new(500, &e.to_string(), None))?;
        }
    }

    // Commit the transaction
    session.commit_transaction().await.map_err(|e| {
        ErrorResponse::new(500, &format!("Failed to commit transaction: {}", e), None)
    })?;

    Ok(())
}
