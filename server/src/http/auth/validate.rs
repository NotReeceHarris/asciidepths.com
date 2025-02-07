use axum::Json;
use serde::{Deserialize, Serialize};
use tracing::info;
use axum::extract::State;

use crate::structs::AppState;

#[derive(Serialize, Deserialize, Debug)]
pub struct ValidateRequest {
    pub token: String,
}

pub async fn validate_handler(State(state): State<AppState>, Json(payload): Json<ValidateRequest>) -> String {

    let _db = &state.db; // Access the database connection

    info!("Validate request: {:?}", payload);
    "Validation successful".to_string()
}