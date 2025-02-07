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
    pub success: bool
}

pub async fn validate_handler(State(state): State<AppState>, Json(payload): Json<Request>) -> Json<Response> {

    let db = &state.db; // Access the database connection

    if payload.session.is_empty() || payload.username.is_empty() {
        return Json(Response {
            success: false
        });
    }

    if payload.session.len() != 64 {
        return Json(Response {
            success: false
        });
    }

    let user = match Users::find()
    .filter(users::Column::Username.eq(&payload.username))
    .one(db.as_ref())
    .await {
        Ok(None) => {
            return Json(Response {
                success: false
            });
        } // Continue
        Ok(Some(user)) => user,
        Err(err) => {
            // Handle database error
            eprintln!("Error querying database: {:?}", err);
            // Return some response indicating a failure
            return Json(Response {
                success: false
            });
        }
    };

    let valid = validate_session(user.id, user.session_key.clone(), payload.session.clone());

    if valid {
        return Json(Response {
            success: true
        });
    } else {
        return Json(Response {
            success: false
        });
    }
}