use mongodb::bson::oid::ObjectId;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct Client {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub username: String,
    pub email: Option<String>,
    pub phone: String,
    pub company_name: String,
    pub city: String,
    pub address: String,

    // Financial fields
    pub invoices: Vec<ObjectId>,
    pub total_owed: f64,          // Total amount the client owes
    pub total_paid: f64,          // Total amount the client has paid
    pub outstanding_balance: f64, // Outstanding balance to be paid
}
#[derive(Serialize, Deserialize)]
// TODO: add time
pub struct NewClient {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub username: String,
    pub email: Option<String>,
    pub phone: String,
    pub company_name: String,
    pub city: String,
    pub address: String,
}
