use mongodb::{
    options::ClientOptions, Client, ClientSession, Collection as MongoCollection, Database,
};
use std::env;

use crate::schema::{collections::Collection, error::ErrorResponse};

pub struct MongoDbState {
    pub database: Database,
    pub client: Client,
}

pub async fn init_db() -> Result<MongoDbState, ErrorResponse> {
    // Retrieve the MongoDB connection string from environment variables
    let mongodb_uri = env::var("DATABASE_STRING").map_err(|e| {
        ErrorResponse::new(
            500,
            "Please provide a valid DATABASE_STRING environment variable.",
            Some(e.to_string()),
        )
    })?;

    // Parse the MongoDB connection string
    let client_options = ClientOptions::parse(mongodb_uri).await.map_err(|e| {
        ErrorResponse::new(
            500,
            "Failed to parse the DATABASE_STRING. Ensure it is a valid MongoDB URI.",
            Some(e.to_string()),
        )
    })?;

    // Initialize the MongoDB client
    let client = Client::with_options(client_options).map_err(|e| {
        ErrorResponse::new(
            500,
            "Failed to initialize MongoDB client.",
            Some(e.to_string()),
        )
    })?;

    // Access the "accounting" database
    let database = client.database("accounting");

    // Return the initialized MongoDbState
    Ok(MongoDbState { database, client })
}

impl MongoDbState {
    /// Dynamically fetch a MongoDB collection
    pub fn get_collection<T: Send + Sync>(&self, collection: Collection) -> MongoCollection<T> {
        self.database.collection(collection.as_str())
    }

    /// Start a new session
    pub async fn start_session(&self) -> Result<ClientSession, ErrorResponse> {
        self.client.start_session().await.map_err(|e| {
            ErrorResponse::new(
                500,
                "Failed to start a MongoDB session.",
                Some(e.to_string()),
            )
        })
    }
}
