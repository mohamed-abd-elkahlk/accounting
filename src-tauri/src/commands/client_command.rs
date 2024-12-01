use crate::{
    db::MongoDbState,
    schema::{
        client_schema::{Client, ClinetStatus, NewClient},
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
        status: ClinetStatus::Active,
        created_at: MongoDateTime::now(),
        updated_at: MongoDateTime::now(),
    };
    // Serialize the client data into a BSON document
    let doc = to_document(&client).map_err(|e| {
        logger::log_error("Failed to serialize client data", 400, Some(&e.to_string()));
        ErrorResponse::new(400, "Failed to serialize client data", Some(e.to_string()))
    })?;

    // Insert the document into the MongoDB collection
    let result = collection.insert_one(doc).await.map_err(|e| {
        logger::log_error("Failed to insert into database", 500, Some(&e.to_string()));

        ErrorResponse::new(500, "Failed to insert into database", Some(e.to_string()))
    })?;

    // Extract the inserted ID and convert it to ObjectId
    let inserted_id = match result.inserted_id {
        Bson::ObjectId(id) => id,
        _ => {
            logger::log_error("Invalid inserted ID", 500, None);

            return Err(ErrorResponse::new(500, "Invalid inserted ID", None));
        }
    };
    // Return the newly created Client struct with necessary fields populated
    client.id = Some(inserted_id);
    logger::log_info("Created new client ", 200, None);
    Ok(client)
}

#[tauri::command]
pub async fn list_all_clients(db: State<'_, Mutex<MongoDbState>>) -> AppResult<Vec<Client>> {
    let db = db.lock().await;
    let collection = db.get_collection::<Client>(Collection::Client);

    // Perform the query to fetch all documents
    let mut cursor = collection.find(doc! {}).await.map_err(|e| {
        logger::log_error("Failed to fetch clients", 500, None);

        ErrorResponse::new(500, "Failed to fetch clients", Some(e.to_string()))
    })?;

    // Collect all documents into a Vec<Client>
    let mut clients: Vec<Client> = Vec::new();

    while let Some(doc) = cursor.try_next().await.map_err(|e| {
        logger::log_error("Failed to parese client data", 500, None);

        ErrorResponse::new(500, "Failed to parese client data", Some(e.to_string()))
    })? {
        clients.push(doc);
    }
    logger::log_info("Retrun all clients", 200, None);

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
            logger::log_error("Failed to update client data", 500, Some(&e.to_string()));

            ErrorResponse::new(500, "Failed to update client data", Some(e.to_string()))
        })?;

    match result {
        Some(updated_doc) => {
            let updated_client = bson::from_document::<Client>(updated_doc).map_err(|e| {
                logger::log_error(
                    "Failed to deserialize updated client",
                    500,
                    Some(&e.to_string()),
                );

                ErrorResponse::new(
                    500,
                    "Failed to deserialize updated client",
                    Some(e.to_string()),
                )
            })?;
            logger::log_info("Retrun updated document", 200, None);

            Ok(updated_client)
        }
        None => {
            logger::log_error("Client not found", 404, None);
            Err(ErrorResponse::new(404, "Client not found", None))
        }
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
        .map_err(|e| {
            logger::log_error("Failed to find client", 404, Some(&e.to_string()));

            ErrorResponse::new(500, "Failed to find client", Some(e.to_string()))
        })?
        .ok_or_else(|| ErrorResponse::new(404, "Client not found", None))?;

    // Deserialize the document into a Client struct
    let client = bson::from_document::<Client>(client_doc).map_err(|e| {
        logger::log_error(
            "Failed to deserialize client data",
            500,
            Some(&e.to_string()),
        );

        ErrorResponse::new(
            500,
            "Failed to deserialize client data",
            Some(e.to_string()),
        )
    })?;
    logger::log_info(
        &format!("Find clinet with ID: {}", client.id.unwrap()),
        200,
        None,
    );

    Ok(client)
}

// Delete client by Id
#[tauri::command]
pub async fn deactive_client(
    db: State<'_, Mutex<MongoDbState>>,
    client_id: String,
) -> AppResult<Client> {
    // Lock the database to safely access it
    let db = db.lock().await;
    let collection = db.get_collection::<Client>(Collection::Client);

    // Parse the client ID into an ObjectId
    let id = parse_object_id(&client_id, "Client")?;

    // Define the update document
    let update = doc! { "$set": { "status": ClinetStatus::InActive.to_string() } };

    // Perform the update operation and retrieve the updated document
    let updated_client = collection
        .find_one_and_update(
            doc! { "_id": id }, // Filter by client ID
            update,             // Set the status to Inactive
        )
        .await
        .map_err(|e| {
            logger::log_error("Failed to deactivate client", 500, Some(&e.to_string()));
            ErrorResponse::new(500, "Failed to deactivate client", Some(e.to_string()))
        })?;

    // Handle the case where no document was found
    let updated_client =
        updated_client.ok_or_else(|| ErrorResponse::new(404, "Client not found", None))?;
    logger::log_info(
        &format!(
            "Find and deactivate clinet with ID: {}",
            updated_client.id.unwrap()
        ),
        200,
        None,
    );

    Ok(updated_client)
}

#[tauri::command]
pub async fn activate_client(
    db: State<'_, Mutex<MongoDbState>>,
    client_id: String,
) -> AppResult<Client> {
    // Lock the database to safely access it
    let db = db.lock().await;
    let collection = db.get_collection::<Client>(Collection::Client);

    // Parse the client ID into an ObjectId
    let id = parse_object_id(&client_id, "Client")?;

    // Define the update document to set the status to "Active"
    let update = doc! { "$set": { "status": ClinetStatus::Active.to_string() } };

    let updated_client_doc = collection
        .find_one_and_update(
            doc! { "_id": id, "status": { "$ne": ClinetStatus::Active.to_string() } }, // Update only if not active
            update,
        )
        .await
        .map_err(|e| {
            logger::log_error("Failed to activate client", 500, Some(&e.to_string()));

            ErrorResponse::new(500, "Failed to activate client", Some(e.to_string()))
        })?;

    // Handle case where no document was updated (client already active or not found)
    let updated_client_doc = updated_client_doc
        .ok_or_else(|| ErrorResponse::new(404, "Client not found or already active", None))?;
    logger::log_info(
        &format!(
            "Find and active clinet with ID: {}",
            updated_client_doc.id.unwrap()
        ),
        200,
        None,
    );

    Ok(updated_client_doc)
}
