use futures::TryStreamExt;
use mongodb::bson::{self, datetime::DateTime as MongoDateTime, doc, Bson, Document};
use tauri::State;
use tokio::sync::Mutex;

use crate::{
    db::MongoDbState,
    schema::{
        collections::Collection,
        error::{AppResult, ErrorResponse},
        product_schema::{NewProduct, Product},
    },
    utils::parse_object_id,
};

#[tauri::command]
pub async fn create_product(
    new_product: NewProduct,
    db: State<'_, Mutex<MongoDbState>>,
) -> AppResult<Product> {
    let db = db.lock().await;
    let collection = db.get_collection::<Document>(Collection::Product);
    let mut product = Product {
        id: None,
        name: new_product.name,
        discription: new_product.discription,
        price: new_product.price,
        stock: new_product.stock,
        created_at: MongoDateTime::now(),
        updated_at: MongoDateTime::now(),
    };
    let doc = bson::to_document(&product).map_err(|e| {
        ErrorResponse::new(400, "Failed to serialize product data", Some(e.to_string()))
    })?;

    let result = collection.insert_one(doc).await.map_err(|e| {
        ErrorResponse::new(500, "Failed to insert into Database", Some(e.to_string()))
    })?;

    let inserted_id = match result.inserted_id {
        Bson::ObjectId(id) => id,
        _ => return Err(ErrorResponse::new(500, "Invalid inserted ID", None)),
    };
    product.id = Some(inserted_id);
    Ok(product)
}

#[tauri::command]
pub async fn delete_product(
    product_id: String,
    db: State<'_, Mutex<MongoDbState>>,
) -> AppResult<String> {
    let db = db.lock().await;

    let collection = db.get_collection::<Product>(Collection::Product);

    let id = parse_object_id(&product_id, "Product")?;

    let result = collection.delete_one(doc! {"_id":id}).await.map_err(|e| {
        logger::log_error("Failed to delete client", 500, Some(&e.to_string()));
        ErrorResponse::new(500, "Failed to delete client", Some(e.to_string()))
    })?;
    if result.deleted_count == 1 {
        logger::log_info(
            &format!("Product with ID {} deleted successfully", product_id),
            204,
            None,
        );
        Ok(format!(
            "Product with ID {} deleted successfully",
            product_id
        ))
    } else {
        logger::log_error("Client not found", 404, None);

        Err(ErrorResponse::new(404, "Client not found", None))
    }
}
#[tauri::command]

pub async fn get_all_products(db: State<'_, Mutex<MongoDbState>>) -> AppResult<Vec<Product>> {
    let db = db.lock().await;
    let collection = db.get_collection::<Product>(Collection::Product);
    let mut cursor = collection
        .find(doc! {})
        .await
        .map_err(|e| ErrorResponse::new(500, "Fiald to fetch Product", Some(e.to_string())))?;
    let mut products: Vec<Product> = Vec::new();
    while let Some(doc) = cursor
        .try_next()
        .await
        .map_err(|e| ErrorResponse::new(500, "fiald to parese client data", Some(e.to_string())))?
    {
        products.push(doc);
    }
    Ok(products)
}
#[tauri::command]
pub async fn get_product_by_id(
    product_id: String,
    db: State<'_, Mutex<MongoDbState>>,
) -> AppResult<Product> {
    let db = db.lock().await;
    let collection = db.get_collection::<Product>(Collection::Product);

    // Convert product_id to ObjectId
    let object_id = parse_object_id(&product_id, "Product")?;

    // Find the product by ID
    let result = collection
        .find_one(doc! { "_id": object_id })
        .await
        .map_err(|e| {
            logger::log_error("Failed to fetch product", 500, Some(&e.to_string()));
            ErrorResponse::new(500, "Failed to fetch product", Some(e.to_string()))
        })?;

    // Handle case where the product is not found
    let product = result.ok_or_else(|| {
        logger::log_error(
            "Product not found",
            404,
            Some("No product matches the given ID"),
        );

        ErrorResponse::new(
            404,
            "Product not found",
            Some("No product matches the given ID".to_string()),
        )
    })?;
    logger::log_info(
        &format!("Found product wiht this ID:{product_id}",),
        200,
        None,
    );
    Ok(product)
}
#[tauri::command]
pub async fn update_product(
    product_id: String,
    updated_fields: Document, // Use a `Document` for flexibility in updating fields
    db: State<'_, Mutex<MongoDbState>>,
) -> AppResult<Product> {
    let db = db.lock().await;
    let collection = db.get_collection::<Product>(Collection::Product);

    // Convert `product_id` to ObjectId
    let object_id = parse_object_id(&product_id, "Product")?;
    // Add `updated_at` to the update document
    let mut updated_fields = updated_fields.clone();
    updated_fields.insert("updated_at", MongoDateTime::now());
    // Prepare the update document with `$set` for partial updates
    let update_doc = doc! {
        "$set": updated_fields
    };

    // Perform the update
    let result = collection
        .update_one(doc! { "_id": object_id }, update_doc)
        .await
        .map_err(|e| {
            logger::log_info(
                "Failed to update product in the database",
                500,
                Some(&e.to_string()),
            );
            ErrorResponse::new(
                500,
                "Failed to update product in the database",
                Some(e.to_string()),
            )
        })?;

    // Check if the product was updated
    if result.matched_count == 0 {
        logger::log_info(
            "Product not found",
            404,
            Some("No product matches the given ID"),
        );
        return Err(ErrorResponse::new(
            404,
            "Product not found",
            Some("No product matches the given ID".to_string()),
        ));
    }

    // Fetch and return the updated product
    let updated_product = collection
        .find_one(doc! { "_id": object_id })
        .await
        .map_err(|e| {
            logger::log_info("Failed to fetch updated product", 500, Some(&e.to_string()));
            ErrorResponse::new(500, "Failed to fetch updated product", Some(e.to_string()))
        })?
        .ok_or_else(|| {
            logger::log_info(
                "Product not found",
                404,
                Some("No product found after update"),
            );
            ErrorResponse::new(
                404,
                "Product not found",
                Some("No product found after update".to_string()),
            )
        })?;
    logger::log_info("Update product", 200, None);
    Ok(updated_product)
}
