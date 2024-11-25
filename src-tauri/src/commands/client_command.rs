use crate::{
    db::MongoDbState,
    schema::{
        client_schema::{Client, NewClient},
        collections::Collection,
        error::{AppResult, ErrorResponse},
    },
    utils::parse_object_id,
};

use futures::TryStreamExt;
use mongodb::bson::{self, doc, to_document, Bson, DateTime as MongoDateTime, Document};
use tauri::State;
use tokio::sync::Mutex;

// Add new Client document to the database
#[tauri::command]
pub async fn add_new_client(
    client: NewClient,
    db: State<'_, Mutex<MongoDbState>>,
) -> AppResult<Client> {
    // lock the db State to work saftelr
    let db = db.lock().await;

    let collection = db.get_collection::<Document>(Collection::Client);
    let mut client = Client {
        id: None,
        username: client.username, // Assumes `NewClient` has a `username` field
        email: client.email,       // Assumes `NewClient` has an `email` field
        phone: client.phone,       // Assumes `NewClient` has a `phone` field
        company_name: client.company_name, // Assumes `NewClient` has a `company_name` field
        city: client.city,         // Assumes `NewClient` has a `city` field
        address: client.address,   // Assumes `NewClient` has an `address` field
        invoices: Vec::new(),      // Assuming new client has no invoices by default
        total_owed: 0.0,           // Assuming new client has no debt
        total_paid: 0.0,           // Assuming new client has not paid anything yet
        outstanding_balance: 0.0,  // Assuming no outstanding balance initially
        created_at: MongoDateTime::now(),
        updated_at: MongoDateTime::now(),
    };
    // Serialize the client data into a BSON document
    let doc = to_document(&client).map_err(|e| {
        ErrorResponse::new(400, "Failed to serialize client data", Some(e.to_string()))
    })?;

    // Insert the document into the MongoDB collection
    let result = collection.insert_one(doc).await.map_err(|e| {
        ErrorResponse::new(500, "Failed to insert into database", Some(e.to_string()))
    })?;

    // Extract the inserted ID and convert it to ObjectId
    let inserted_id = match result.inserted_id {
        Bson::ObjectId(id) => id,
        _ => return Err(ErrorResponse::new(500, "Invalid inserted ID", None)),
    };
    // Return the newly created Client struct with necessary fields populated
    client.id = Some(inserted_id);
    Ok(client)
}

#[tauri::command]
pub async fn list_all_clients(db: State<'_, Mutex<MongoDbState>>) -> AppResult<Vec<Client>> {
    let db = db.lock().await;
    let collection = db.get_collection::<Client>(Collection::Client);

    // Perform the query to fetch all documents
    let mut cursor = collection
        .find(doc! {})
        .await
        .map_err(|e| ErrorResponse::new(500, "Failed to fetch clients", Some(e.to_string())))?;

    // Collect all documents into a Vec<Client>
    let mut clients: Vec<Client> = Vec::new();

    while let Some(doc) = cursor
        .try_next()
        .await
        .map_err(|e| ErrorResponse::new(500, "fiald to parese client data", Some(e.to_string())))?
    {
        clients.push(doc);
    }
    Ok(clients)
}

// Update Client Data
#[tauri::command]
pub async fn update_client(
    db: State<'_, Mutex<MongoDbState>>,
    client_id: String,
    updated_fields: Document, // Use a `Document` for flexibility in updating fields
) -> AppResult<Client> {
    let db = db.lock().await;
    let collection = db.get_collection::<Document>(Collection::Client);
    let id = parse_object_id(&client_id, "Client")?;

    // Add `updated_at` to the update document
    let mut updated_fields = updated_fields.clone();
    updated_fields.insert("updated_at", MongoDateTime::now());

    // Prepare the update document with `$set` for partial updates
    let update_doc = doc! {
        "$set": updated_fields
    };

    let result = collection
        .find_one_and_update(
            doc! {
                "_id":id
            },
            update_doc,
        )
        .await
        .map_err(|e| {
            ErrorResponse::new(500, "Failed to update client data", Some(e.to_string()))
        })?;

    match result {
        Some(updated_doc) => {
            let updated_client = bson::from_document::<Client>(updated_doc).map_err(|e| {
                ErrorResponse::new(
                    500,
                    "Failed to deserialize updated client",
                    Some(e.to_string()),
                )
            })?;
            Ok(updated_client)
        }
        None => Err(ErrorResponse::new(404, "Client not found", None)),
    }
}

// Find client by Id
#[tauri::command]
pub async fn find_client_by_id(
    client_id: String,
    db: State<'_, Mutex<MongoDbState>>,
) -> Result<Client, ErrorResponse> {
    let db = db.lock().await;

    // Get the collection
    let collection = db.get_collection::<Document>(Collection::Client);

    // Search for the client by ID
    let id = parse_object_id(&client_id, "Client")?;
    let filter = doc! { "_id": id};
    let client_doc = collection
        .find_one(filter)
        .await
        .map_err(|e| ErrorResponse::new(500, "Failed to find client", Some(e.to_string())))?
        .ok_or_else(|| ErrorResponse::new(404, "Client not found", None))?;

    // Deserialize the document into a Client struct
    let client = bson::from_document::<Client>(client_doc).map_err(|e| {
        ErrorResponse::new(
            500,
            "Failed to deserialize client data",
            Some(e.to_string()),
        )
    })?;

    Ok(client)
}

// Delete client by Id
#[tauri::command]
pub async fn delete_client(
    db: State<'_, Mutex<MongoDbState>>,
    client_id: String,
) -> AppResult<String> {
    // Lock the database to safely access it
    let db = db.lock().await;
    let collection = db.get_collection::<Document>(Collection::Client);
    let id = parse_object_id(&client_id, "Client")?;
    // Perform the delete operation
    let result = collection
        .delete_one(
            doc! { "_id": id}, // Filter by client ID
        )
        .await
        .map_err(|e| ErrorResponse::new(500, "Failed to delete client", Some(e.to_string())))?;

    // Check if a document was deleted
    if result.deleted_count == 1 {
        // Return success message if one document was deleted
        Ok(format!("Client with ID {} deleted successfully", client_id))
    } else {
        // Return error if no document was found to delete
        Err(ErrorResponse::new(404, "Client not found", None))
    }
}
