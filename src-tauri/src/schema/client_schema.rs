use core::fmt;
use std::fmt::Display;

use mongodb::bson::{oid::ObjectId, DateTime};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct Client {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub username: String,
    pub email: Option<String>,
    pub phone: String,
    pub company_name: String,
    pub city: String,
    pub address: String,
    pub status: ClinetStatus,
    // Financial fields
    pub invoices: Vec<ObjectId>,
    pub total_owed: f64,          // Total amount the client owes
    pub total_paid: f64,          // Total amount the client has paid
    pub outstanding_balance: f64, // Outstanding balance to be paid

    // Date fields
    pub created_at: DateTime, // When the client record was created
    pub updated_at: DateTime, // When the client record was last updated
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

#[derive(Serialize, Deserialize, Debug)]
pub enum ClinetStatus {
    Active,
    InActive,
}

impl Display for ClinetStatus {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            ClinetStatus::Active => write!(f, "Active"),
            ClinetStatus::InActive => write!(f, "InActive"),
        }
    }
}
