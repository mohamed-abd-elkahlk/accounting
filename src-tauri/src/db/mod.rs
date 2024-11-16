use mongodb::{options::ClientOptions, Client, Collection as MongoCollection, Database};
use std::env;

use crate::schema::collections::Collection;

pub struct MongoDbState {
    pub database: Database,
}
pub async fn init_db() -> MongoDbState {
    let mongodb_uri = env::var("DATABASE_STRING").expect("DATABASE_STRING must be set");

    let client_options = ClientOptions::parse(&mongodb_uri)
        .await
        .expect("Invalid MongoDB URI");

    let client = Client::with_options(client_options).expect("Failed to initialize client");
    let database = client.database("accounting");
    MongoDbState { database }
}

impl MongoDbState {
    /// Dynamically fetch a MongoDB collection
    pub fn get_collection<T: Send + Sync>(&self, collection: Collection) -> MongoCollection<T> {
        self.database.collection(collection.as_str())
    }
}
