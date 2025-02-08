use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine};
use socketioxide::extract::SocketRef;
use tracing::info;
use serde_json::json;

use crate::constants::ALLOWED_ORIGIN;
use crate::structs::AppState;

use sea_orm::*;

use crate::utilities::validate_session;
use crate::entities::{prelude::*, *};

fn decode_token(token: &str) -> Option<String> {
    match URL_SAFE_NO_PAD.decode(token) {
        Ok(decoded_bytes) => String::from_utf8(decoded_bytes).ok(),
        Err(_) => None,
    }
}

pub async fn connect_event(socket: SocketRef, state: AppState/* , Data(data): Data<Value> */) {
    let headers = &socket.req_parts().headers;
    let origin = headers.get("Origin").and_then(|v| v.to_str().ok());

    // Validate the Origin
    if origin != Some(ALLOWED_ORIGIN) {
        info!("Rejected connection from origin: {:?}", origin);
        socket.disconnect().ok();
        return;
    }

    let mut username = String::new();
    let mut session = String::new();

    if let Some(query_params) = socket.req_parts().uri.query() {
        for part in query_params.split("&") {
            if part.starts_with("token=") {
                let token = part.split("=").last().unwrap();
                if let Some(decoded_token) = decode_token(token) {
                    let parts: Vec<&str> = decoded_token.split(":").collect();

                    if parts.len() == 2 {
                        username = parts[0].to_string();
                        session = parts[1].to_string();
                    } else {
                        info!("Invalid token format, rejecting connection.");
                        socket.disconnect().ok();
                        return;
                    }
                } else {
                    info!("Invalid Base64Url token, rejecting connection.");
                    socket.disconnect().ok();
                    return;
                }
            }
        }
    } else {
        info!("No query parameters provided, rejecting connection.");
        socket.disconnect().ok();
        return;
    }

    if username.is_empty() || session.is_empty() {
        socket.disconnect().ok();
        return;
    }

    let db = &state.db;     // Access the database

    let user = match Users::find()
    .filter(users::Column::Username.eq(&username))
    .one(db.as_ref())
    .await {
        Ok(None) => {
            socket.disconnect().ok();
            return;
        } // Continue
        Ok(Some(user)) => user,
        Err(err) => {
            info!("Error querying database: {:?}", err);
            socket.disconnect().ok();
            return;
        }
    };

    if !validate_session(user.id, user.session_key, session) {
        info!("Invalid session, rejecting connection.");
        socket.disconnect().ok();
        return;
    }

    // send a message to the client
    let _ = socket.emit("authenticated", &json!({ "username": username }));

    info!("Socket.IO connected: {:?}", socket.id);
}