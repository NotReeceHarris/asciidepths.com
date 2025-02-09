use axum::{Json, extract::State};
use serde::{Deserialize, Serialize};
use sea_orm::*;

use crate::structs::AppState;
use crate::utilities::validate_session;
use crate::entities::{prelude::*, *};

#[derive(Serialize, Deserialize, Debug)]
pub struct Request {
    pub username: String,
    pub session: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Response {
    pub success: bool,
}

pub async fn validate_handler(
    State(state): State<AppState>,
    Json(payload): Json<Request>,
) -> Json<Response> {
    let db = &state.db; // Access the database connection

    // Validate input fields
    if payload.session.is_empty() || payload.username.is_empty() || payload.session.len() != 64 {
        return Json(Response { success: false });
    }

    // Find the user by username
    let user = match Users::find()
        .filter(users::Column::Username.eq(&payload.username))
        .one(db.as_ref())
        .await
    {
        Ok(Some(user)) => user,
        Ok(None) => {
            return Json(Response { success: false });
        }
        Err(err) => {
            eprintln!("Error querying database: {:?}", err);
            return Json(Response { success: false });
        }
    };

    // Validate the session
    let valid = validate_session(user.id, user.session_key, payload.session);

    Json(Response { success: valid })
}