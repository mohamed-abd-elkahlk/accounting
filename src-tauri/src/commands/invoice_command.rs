use std::collections::HashMap;

use futures::StreamExt;
use mongodb::bson::{self, doc, oid::ObjectId, DateTime, Document};
use tauri::State;
use tokio::sync::Mutex;

use crate::{
    db::MongoDbState,
    schema::{
        client_schema::Client,
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
        logger::log_error(
            "Failed to start MongoDB transaction.",
            500,
            Some(&e.to_string()),
        );
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
                logger::log_error("Product not found", 404, Some(&e.to_string()));
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
            logger::log_error(
                &format!("Insufficient stock for product: {}", goods.name).as_str(),
                400,
                None,
            );
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
                logger::log_error(
                    &format!("Failed to update Product with ID: {}", product_id),
                    400,
                    Some(&e.to_string()),
                );
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
        logger::log_error(
            "Total paid must be less than or equial total price",
            400,
            None,
        );
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
    let inserted_invoice_id = match insert_result {
        Ok(res) => {
            logger::log_info(
                &format!("Inserted invoice with ID: {:?}", res.inserted_id),
                200,
                None,
            );
            res.inserted_id.as_object_id().ok_or_else(|| {
                logger::log_error("Failed to retrieve inserted invoice ID", 500, None);
                ErrorResponse::new(500, "Failed to retrieve inserted invoice ID", None)
            })?
        }
        Err(e) => {
            session.abort_transaction().await.ok();
            logger::log_error(&format!("Failed to insert invoice: {}", e), 500, None);
            return Err(ErrorResponse::new(
                500,
                &format!("Failed to insert invoice: {}", e),
                None,
            ));
        }
    };
    let client_collection = db.get_collection::<Client>(Collection::Client);

    // Fetch the client document
    let client = match client_collection
        .find_one(doc! { "_id": new_invoice.client_id })
        .await
    {
        Ok(Some(doc)) => doc, // Successfully found the client document
        Ok(None) => {
            session.abort_transaction().await.ok();
            logger::log_error(
                &format!(
                    "Failed to find client with ID: {} for Invoice ID: {}",
                    new_invoice.client_id,
                    new_invoice.id.unwrap_or_default()
                ),
                404,
                None,
            );
            return Err(ErrorResponse::new(
                404,
                &format!("Client not found for ID: {}", new_invoice.client_id),
                None,
            ));
        }
        Err(e) => {
            session.abort_transaction().await.ok();
            logger::log_error(
                &format!(
                    "Failed to fetch client for Invoice ID: {}: {}",
                    new_invoice.id.unwrap_or_default(),
                    e
                ),
                500,
                Some(&e.to_string()),
            );
            return Err(ErrorResponse::new(
                500,
                &format!(
                    "Failed to fetch client for Invoice ID: {}",
                    new_invoice.id.unwrap_or_default()
                ),
                Some(e.to_string()),
            ));
        }
    };

    // Calculate financial values
    let total_paid = new_invoice.total_paid; // Amount paid for this invoice
    let total_owed = total_price - total_paid; // Remaining balance for this invoice
    let new_outstanding_balance = client.outstanding_balance + total_owed; // Client's updated outstanding balance

    // Update the client document with the new totals
    if let Err(e) = client_collection
        .update_one(
            doc! { "_id": new_invoice.client_id },
            doc! {
                "$inc": {
                    "totalOwed": total_owed,
                    "totalPaid": total_paid,
                },
                "$push": { "invoices": inserted_invoice_id },
                "$set": {
                    "outstanding_balance": new_outstanding_balance,
                    "updated_at": DateTime::now(),
                }
            },
        )
        .session(&mut session)
        .await
    {
        session.abort_transaction().await.ok();
        logger::log_error(
            &format!(
                "Failed to update client with ID: {} for Invoice ID: {}",
                new_invoice.client_id,
                new_invoice.id.unwrap_or_default()
            ),
            500,
            Some(&e.to_string()),
        );
        return Err(ErrorResponse::new(
            500,
            "Failed to update client.",
            Some(e.to_string()),
        ));
    }

    // Commit the transaction
    session.commit_transaction().await.map_err(|e| {
        logger::log_error(
            "Failed to commit MongoDB transaction.",
            500,
            Some(&e.to_string()),
        );
        ErrorResponse::new(
            500,
            "Failed to commit MongoDB transaction.",
            Some(e.to_string()),
        )
    })?;
    logger::log_info("Create new invoice", 201, None);
    Ok(())
}

#[tauri::command]
pub async fn list_all_invoices(db: State<'_, Mutex<MongoDbState>>) -> AppResult<Vec<Invoice>> {
    let db = db.lock().await;
    let invoice_collection = db.get_collection::<Document>(Collection::Invoice);
    let cursor = invoice_collection.find(doc! {}).await.map_err(|e| {
        logger::log_error("Faild to serialize invoice data", 500, Some(&e.to_string()));

        ErrorResponse::new(500, "Failed to serialize invoice data", Some(e.to_string()))
    })?;

    let invoices: Vec<Invoice> = {
        let mut invoice_vec = Vec::new();
        let mut stream = cursor;

        while let Some(result) = stream.next().await {
            match result {
                Ok(doc) => match bson::from_document::<Invoice>(doc) {
                    Ok(invoice) => invoice_vec.push(invoice), // Add valid invoices to the vector
                    Err(e) => {
                        logger::log_error(
                            "Failed to serialize invoice data",
                            500,
                            Some(&e.to_string()),
                        );

                        return Err(ErrorResponse::new(
                            500,
                            "Failed to serialize invoice data",
                            Some(e.to_string()),
                        ));
                    }
                },
                Err(e) => {
                    logger::log_error(
                        "Failed to retrieve a document from the cursor",
                        500,
                        Some(&e.to_string()),
                    );

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
    logger::log_info(
        &format!("List all invices with count: {}", invoices.len()),
        200,
        None,
    );
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

        Err(e) => {
            logger::log_error(
                &format!("No Invoice wiht this ID: {invoice_id}"),
                404,
                Some(&e.to_string()),
            );

            Err(ErrorResponse::new(
                404,
                &format!("No Invoice wiht this ID: {invoice_id}"),
                Some(e.to_string()),
            ))
        }
    }?;
    logger::log_info(
        &format!("Found Invoice wiht this ID: {invoice_id}"),
        200,
        None,
    );

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
    let mut session = db.start_session().await?;

    session.start_transaction().await.map_err(|e| {
        logger::log_error(
            &format!("Failed to start transaction: {}", e),
            500,
            Some(&e.to_string()),
        );

        ErrorResponse::new(
            500,
            &format!("Failed to start transaction: {}", e),
            Some(e.to_string()),
        )
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
        .map_err(|e| {
            logger::log_error(&e.to_string(), 400, None);
            ErrorResponse::new(400, &e.to_string(), None)
        })?
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
            logger::log_error(&format!("Invalid invoice data: {}", e), 400, None);

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
                    logger::log_error("Faild to update invoice", 500, Some(&e.to_string()));

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
                    logger::log_error(&e.to_string(), 500, None);

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
                    logger::log_error(&e.to_string(), 500, None);

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
        logger::log_error(
            "Total paid must be less than or equial total price",
            400,
            None,
        );

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
        created_at: existing_invoice.created_at,
        ..updated_invoice
    };
    let client_collection = db.get_collection::<Client>(Collection::Client);
    // Calculate financial adjustments
    let original_total_paid = existing_invoice.total_paid;
    let original_total_owed = existing_invoice.total_price - original_total_paid;

    let updated_total_paid = updated_invoice.total_paid;
    let updated_total_owed = total_price - updated_total_paid;

    // Adjust outstanding balance
    let outstanding_balance_adjustment = updated_total_owed - original_total_owed;

    // Update the client's financial records directly
    if let Err(e) = client_collection
        .update_one(
            doc! { "_id": updated_invoice.client_id },
            doc! {
                "$inc": {
                    "totalOwed": updated_total_owed - original_total_owed,
                    "totalPaid": updated_total_paid - original_total_paid,
                    "outstanding_balance": outstanding_balance_adjustment,
                },
                "$set": {
                    "updated_at": DateTime::now(),
                }
            },
        )
        .session(&mut session)
        .await
    {
        session.abort_transaction().await.ok();
        logger::log_error(
            &format!(
                "Failed to update client with ID: {} for Invoice ID: {}",
                updated_invoice.client_id,
                updated_invoice.id.unwrap_or_default()
            ),
            500,
            Some(&e.to_string()),
        );
        return Err(ErrorResponse::new(
            500,
            "Failed to update client.",
            Some(e.to_string()),
        ));
    }

    // Update the invoice
    match invoice_collection
        .find_one_and_replace(doc! { "_id": id }, updated_invoice)
        .session(&mut session)
        .await
    {
        Ok(_) => (),
        Err(e) => {
            session.abort_transaction().await.ok();
            logger::log_error(&e.to_string(), 500, None);
            return Err(ErrorResponse::new(500, &e.to_string(), None))?;
        }
    }

    // Commit the transaction
    session.commit_transaction().await.map_err(|e| {
        logger::log_error(&format!("Failed to commit transaction: {}", e), 500, None);
        ErrorResponse::new(500, &format!("Failed to commit transaction: {}", e), None)
    })?;

    logger::log_info(
        &format!("Updated invoice with ID: {}", invoice_id),
        200,
        None,
    );

    Ok(())
}

#[tauri::command]
pub async fn list_all_invoices_with_client_id(
    client_id: String,
    db: State<'_, Mutex<MongoDbState>>,
) -> AppResult<Vec<Invoice>> {
    let db = db.lock().await;
    let invoice_collection = db.get_collection::<Invoice>(Collection::Invoice);

    // Convert client_id to ObjectId
    let client_object_id = parse_object_id(&client_id, "Client")?;

    // Query for invoices with the specified client_id
    let filter = doc! { "clientId": client_object_id };

    let mut cursor = invoice_collection.find(filter).await.map_err(|e| {
        logger::log_error(
            &format!("Failed to fetch invoices for client ID: {}", client_id),
            500,
            Some(&e.to_string()),
        );
        ErrorResponse::new(500, "Failed to fetch invoices.", Some(e.to_string()))
    })?;

    let mut invoices = Vec::new();
    while let Some(invoice_doc) = cursor.next().await {
        match invoice_doc {
            Ok(invoice) => {
                invoices.push(invoice);
            }
            Err(e) => {
                logger::log_error(
                    &format!("Error processing invoice document: {}", e),
                    500,
                    Some(&e.to_string()),
                );
                return Err(ErrorResponse::new(
                    500,
                    "Error processing invoice document.",
                    Some(e.to_string()),
                ));
            }
        }
    }

    logger::log_info(
        &format!(
            "Fetched {} invoices for client ID: {}",
            invoices.len(),
            client_id
        ),
        200,
        None,
    );

    Ok(invoices)
}
