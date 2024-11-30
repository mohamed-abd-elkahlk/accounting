use core::fmt;

use mongodb::bson::{oid::ObjectId, DateTime};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct NewInvoice {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    #[serde(rename = "clientId")]
    pub client_id: ObjectId,
    pub goods: Vec<Goods>,
    #[serde(rename = "totalPaid")]
    pub total_paid: f64,
}
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Goods {
    pub name: String,
    pub price: f64,
    pub quantity: i64,
    #[serde(rename = "productId")]
    pub product_id: ObjectId,
}
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Invoice {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    #[serde(rename = "clientId")]
    pub client_id: ObjectId,
    pub goods: Vec<Goods>,
    #[serde(rename = "totalPaid")]
    pub total_paid: f64,
    pub status: Status,
    #[serde(rename = "totalPrice")]
    pub total_price: f64,
    // Date fields
    pub created_at: DateTime,
    pub updated_at: DateTime,
}
#[derive(Serialize, Deserialize, Clone, Debug)]
pub enum Status {
    Paid,
    UnPaid,
    PartialPaid,
}
impl fmt::Display for Status {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Status::Paid => write!(f, "Paid"),
            Status::PartialPaid => write!(f, "PartialPaid"),
            Status::UnPaid => write!(f, "UnPaid"),
        }
    }
}
