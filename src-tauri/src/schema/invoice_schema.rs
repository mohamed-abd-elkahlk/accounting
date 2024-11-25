use mongodb::bson::{oid::ObjectId, DateTime};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct NewInvoice {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub client_id: ObjectId,
    pub goods: Vec<ObjectId>,
}
#[derive(Serialize, Deserialize)]
pub struct Invoice {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub client_id: ObjectId,
    pub goods: Vec<ObjectId>,
    // Date fields
    pub created_at: DateTime, // When the client record was created
    pub updated_at: DateTime, // When the client record was last updated
}
