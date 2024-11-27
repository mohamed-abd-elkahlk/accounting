use mongodb::bson::{oid::ObjectId, DateTime};
use serde::{Deserialize, Serialize};

use super::{client_schema::Client, product_schema::Product};

#[derive(Serialize, Deserialize)]
pub struct NewInvoice {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    #[serde(rename = "clientId")]
    pub client_id: ObjectId,
    pub goods: Vec<Goods>,
}
#[derive(Serialize, Deserialize, Clone)]
pub struct Goods {
    #[serde(rename = "productId")]
    pub product_id: ObjectId,
    pub quantity: u32,
}
#[derive(Serialize, Deserialize)]
pub struct Invoice {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    #[serde(rename = "clientId")]
    pub client_id: ObjectId,
    pub goods: Vec<Goods>,
    // Date fields
    pub created_at: DateTime,
    pub updated_at: DateTime,
}
#[derive(Serialize, Deserialize)]

pub struct InvoiceDetails {
    #[serde(rename = "_id")]
    pub id: ObjectId,
    pub client: Client,
    pub goods: Vec<Product>,
    pub total: f64,
    pub created_at: DateTime,
    pub updated_at: DateTime,
}
