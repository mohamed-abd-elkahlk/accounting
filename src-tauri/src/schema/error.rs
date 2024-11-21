use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ErrorResponse {
    pub code: u16,               // HTTP-like status code
    pub message: String,         // Error message
    pub details: Option<String>, // Optional additional details
}

impl ErrorResponse {
    pub fn new(code: u16, message: &str, details: Option<String>) -> Self {
        Self {
            code,
            message: message.to_string(),
            details,
        }
    }
}

pub type AppResult<T> = Result<T, ErrorResponse>;
