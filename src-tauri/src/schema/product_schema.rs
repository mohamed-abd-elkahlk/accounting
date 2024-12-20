use mongodb::bson::{oid::ObjectId, DateTime};
use serde::{Deserialize, Serialize};
#[derive(Serialize, Deserialize)]
pub struct Product {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub name: String,
    pub discription: Option<String>,
    pub price: f64,
    pub stock: i64,
    // Date fields
    pub created_at: DateTime,
    pub updated_at: DateTime,
}

#[derive(Serialize, Deserialize)]
pub struct NewProduct {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub name: String,
    pub discription: Option<String>,
    pub price: f64,
    pub stock: i64,
}
