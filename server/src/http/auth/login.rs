use axum::Json;
use serde::{Deserialize, Serialize};
use tracing::info;
use axum::extract::State;

use crate::structs::AppState;

#[derive(Serialize, Deserialize, Debug)]
pub struct Request {
    pub email: String,
    pub password: String,
}

pub async fn login_handler(State(state): State<AppState>, Json(payload): Json<Request>) -> String {

    let _db = &state.db; // Access the database connection

    info!("Login request: {:?}", payload);
    "Login successful".to_string()

}