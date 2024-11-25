use crate::schema::error::{AppResult, ErrorResponse};
use mongodb::bson::oid::ObjectId;

/// Parses a string into an `ObjectId` with error handling.
///
/// # Arguments
/// * `id` - The ID string to parse.
/// * `context` - A description of the context for error reporting (e.g., "Invoice", "Product").
///
/// # Returns
/// * `AppResult<ObjectId>` - Returns an `ObjectId` if parsing is successful, or an `ErrorResponse` if it fails.
pub fn parse_object_id(id: &str, context: &str) -> AppResult<ObjectId> {
    ObjectId::parse_str(id).map_err(|e| {
        ErrorResponse::new(
            400,
            format!("Invalid {} ID format", context).as_str(),
            Some(e.to_string()),
        )
    })
}
