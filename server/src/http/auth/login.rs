use axum::{Json, extract::State};
use serde::{Deserialize, Serialize};
use sea_orm::*;

use crate::structs::AppState;
use crate::utilities::{generate_session, generate_session_key, verify_password, validate_email};
use crate::entities::{prelude::*, *};

#[derive(Serialize, Deserialize, Debug)]
pub struct Request {
    pub email: String,
    pub password: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Response {
    pub success: bool,
    pub errors: Vec<String>,
    pub session: Option<String>,
}

pub async fn login_handler(
    State(state): State<AppState>,
    Json(payload): Json<Request>,
) -> Json<Response> {
    let db = &state.db; // Access the database

    // Validate fields
    if payload.password.is_empty() || payload.email.is_empty() {
        return Json(Response {
            success: false,
            errors: vec![String::from("Email and password are required")],
            session: None,
        });
    }

    if !validate_email(&payload.email) {
        return Json(Response {
            success: false,
            errors: vec![String::from("Email or password is incorrect")],
            session: None,
        });
    }

    // Find the user by email
    let user = match Users::find()
        .filter(users::Column::Email.eq(&payload.email))
        .one(db.as_ref())
        .await
    {
        Ok(Some(user)) => user,
        Ok(None) => {
            return Json(Response {
                success: false,
                errors: vec![String::from("Email or password is incorrect")],
                session: None,
            });
        }
        Err(err) => {
            eprintln!("Error querying database: {:?}", err);
            return Json(Response {
                success: false,
                errors: vec![String::from("Internal server error")],
                session: None,
            });
        }
    };

    // Verify the password
    if !verify_password(&payload.password, &user.password) {
        return Json(Response {
            success: false,
            errors: vec![String::from("Email or password is incorrect")],
            session: None,
        });
    }

    // Generate a new session key
    let session_key = generate_session_key();

    // Update the user's session key
    let updated_user = users::ActiveModel {
        id: ActiveValue::Set(user.id),
        session_key: ActiveValue::Set(session_key.clone()),
        ..Default::default()
    };

    if let Err(err) = updated_user.update(db.as_ref()).await {
        eprintln!("Error updating user in database: {:?}", err);
        return Json(Response {
            success: false,
            errors: vec![String::from("Internal server error")],
            session: None,
        });
    }

    // Generate a session token
    let session = generate_session(user.id, user.username, session_key);

    Json(Response {
        success: true,
        errors: vec![],
        session: Some(session),
    })
}