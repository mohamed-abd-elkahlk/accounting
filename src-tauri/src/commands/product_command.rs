use futures::TryStreamExt;
use mongodb::bson::{
    self, datetime::DateTime as MongoDateTime, doc, oid::ObjectId, Bson, Document,
};
use tauri::State;
use tokio::sync::Mutex;

use crate::{
    db::MongoDbState,
    schema::{
        collections::Collection,
        error::{AppResult, ErrorResponse},
        product_schema::{NewProduct, Product},
    },
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

    let id = ObjectId::parse_str(product_id.clone())
        .map_err(|e| ErrorResponse::new(400, "invalid id ", Some(e.to_string())))?;

    let result = collection
        .delete_one(doc! {"_id":id})
        .await
        .map_err(|e| ErrorResponse::new(500, "Failed to delete client", Some(e.to_string())))?;
    if result.deleted_count == 1 {
        Ok(format!(
            "Product with ID {} deleted successfully",
            product_id
        ))
    } else {
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
    let object_id = ObjectId::parse_str(&product_id)
        .map_err(|e| ErrorResponse::new(400, "Invalid product ID format", Some(e.to_string())))?;

    // Find the product by ID
    let result = collection
        .find_one(doc! { "_id": object_id })
        .await
        .map_err(|e| ErrorResponse::new(500, "Failed to fetch product", Some(e.to_string())))?;

    // Handle case where the product is not found
    let product = result.ok_or_else(|| {
        ErrorResponse::new(
            404,
            "Product not found",
            Some("No product matches the given ID".to_string()),
        )
    })?;

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
    let object_id = mongodb::bson::oid::ObjectId::parse_str(&product_id)
        .map_err(|e| ErrorResponse::new(400, "Invalid product ID format", Some(e.to_string())))?;

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
            ErrorResponse::new(
                500,
                "Failed to update product in the database",
                Some(e.to_string()),
            )
        })?;

    // Check if the product was updated
    if result.matched_count == 0 {
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
            ErrorResponse::new(500, "Failed to fetch updated product", Some(e.to_string()))
        })?
        .ok_or_else(|| {
            ErrorResponse::new(
                404,
                "Product not found",
                Some("No product found after update".to_string()),
            )
        })?;

    Ok(updated_product)
}
