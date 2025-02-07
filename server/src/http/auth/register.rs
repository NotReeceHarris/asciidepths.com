use axum::{Json, extract::State};
use serde::{Deserialize, Serialize};
use sea_orm::*;

use crate::structs::AppState;
use crate::utilities::{generate_session, generate_session_key, hash_password, validate_email, validate_username};
use crate::entities::{prelude::*, *};

#[derive(Serialize, Deserialize, Debug)]
pub struct Request {
    pub username: String,
    pub password: String,
    pub email: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Response {
    pub success: bool,
    pub errors: Vec<String>,
    pub session: Option<String>
}

pub async fn register_handler(State(state): State<AppState>, Json(payload): Json<Request>) -> Json<Response> {
    let db = &state.db;     // Access the database
    let normalized_username = payload.username.trim().to_lowercase();

    // Check if username is in the cache (fast rejection)
    if state.is_denied_username_cached(&normalized_username) {
        return Json(Response {
            success: false,
            errors: vec![String::from("Invalid username")],
            session: None
        });
    }

    // Validate fields
    if normalized_username.is_empty() || payload.password.is_empty() || payload.email.is_empty() {
        return Json(Response {
            success: false,
            errors: vec![String::from("Username, password, and email are required")],
            session: None
        });
    }

    if !validate_email(&payload.email) {
        return Json(Response {
            success: false,
            errors: vec![String::from("Invalid email address")],
            session: None
        });
    }

    if !validate_username(&normalized_username) {
        state.cache_denied_username(normalized_username);
        return Json(Response {
            success: false,
            errors: vec![String::from("Invalid username")],
            session: None
        });
    }

    // Check if email is already in use
    match Users::find()
    .filter(
        Condition::any()  // This allows for OR conditions
            .add(users::Column::Email.eq(&payload.email))
            .add(users::Column::Username.eq(&normalized_username))
    )
    .one(db.as_ref())
    .await {
        Ok(None) => {} // Continue
        Ok(Some(user)) => {

            println!("User already exists: {:?}", user);

            let error = if user.email == payload.email {
                "Email already in use"
            } else {
                "Username already in use"
            };

            return Json(Response {
                success: false,
                errors: vec![String::from(error)],
                session: None
            });
        }
        Err(err) => {
            // Handle database error
            eprintln!("Error querying database: {:?}", err);
            // Return some response indicating a failure
            return Json(Response {
                success: false,
                errors: vec![String::from("Internal server error.")],
                session: None
            });
        }
    }

    let session_key = generate_session_key();

    let new_user = users::ActiveModel {
        username: ActiveValue::Set(normalized_username.clone()),
        email: ActiveValue::Set(payload.email.clone()),
        password: ActiveValue::Set(hash_password(&payload.password)),
        session_key: ActiveValue::Set(session_key.clone()),
        ..Default::default()
    };

    let res = match Users::insert(new_user).exec(db.as_ref()).await {
        Ok(user) => user,
        Err(err) => {
            // Handle database error
            eprintln!("Error querying database: {:?}", err);
            // Return some response indicating a failure
            return Json(Response {
                success: false,
                errors: vec![String::from("Internal server error")],
                session: None
            })
        }
    };

    let session = generate_session(res.last_insert_id, normalized_username.to_owned(), session_key.to_owned());

    Json(Response {
        success: false,
        errors: vec![],
        session: Some(session)
    })
}
