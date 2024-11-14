use mongodb::{options::ClientOptions, Client, Database};
use std::env;
pub struct MongoDbState {
    pub client: Client,
    pub database: Database,
}
pub async fn init_db() -> MongoDbState {
    let mongodb_uri = env::var("DATABASE_STRING").expect("DATABASE_STRING must be set");

    let client_options = ClientOptions::parse(&mongodb_uri)
        .await
        .expect("Invalid MongoDB URI");

    let client = Client::with_options(client_options).expect("Failed to initialize client");
    let database = client.database("accounting");
    MongoDbState { client, database }
}
