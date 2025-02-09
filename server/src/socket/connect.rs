use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine};
use socketioxide::extract::SocketRef;
use tracing::info;
use serde_json::json;
use sea_orm::*;

use crate::utilities::validate_session;
use crate::entities::{prelude::*, *};
use crate::constants::ALLOWED_ORIGIN;
use crate::structs::AppState;
use crate::socket::disconnect::disconnect_event;

fn decode_token(token: &str) -> Option<String> {
    URL_SAFE_NO_PAD.decode(token)
        .ok()
        .and_then(|decoded_bytes| String::from_utf8(decoded_bytes).ok())
}

pub async fn connect_event(socket: SocketRef, state: AppState) {
    let headers = &socket.req_parts().headers;
    let origin = headers.get("Origin").and_then(|v| v.to_str().ok());

    // Validate the Origin
    if origin != Some(ALLOWED_ORIGIN) {
        info!("Rejected connection from origin: {:?}", origin);
        let _ = socket.disconnect();
        return;
    }

    // Extract and decode token from query parameters
    let (username, session) = match socket.req_parts().uri.query() {
        Some(query_params) => {
            let mut username = String::new();
            let mut session = String::new();

            for part in query_params.split('&') {
                if part.starts_with("token=") {
                    if let Some(token) = part.split('=').last() {
                        if let Some(decoded_token) = decode_token(token) {
                            let parts: Vec<&str> = decoded_token.split(':').collect();
                            if parts.len() == 2 {
                                username = parts[0].to_string();
                                session = parts[1].to_string();
                            } else {
                                info!("Invalid token format, rejecting connection.");
                                let _ = socket.disconnect();
                                return;
                            }
                        } else {
                            info!("Invalid Base64Url token, rejecting connection.");
                            let _ = socket.disconnect();
                            return;
                        }
                    }
                }
            }

            if username.is_empty() || session.is_empty() {
                info!("Missing username or session in token, rejecting connection.");
                let _ = socket.disconnect();
                return;
            }

            (username, session)
        }
        None => {
            info!("No query parameters provided, rejecting connection.");
            let _ = socket.disconnect();
            return;
        }
    };

    let db = &state.db; // Access the database

    // Find the user by username
    let user = match Users::find()
        .filter(users::Column::Username.eq(&username))
        .one(db.as_ref())
        .await
    {
        Ok(Some(user)) => user,
        Ok(None) => {
            info!("User not found, rejecting connection.");
            let _ = socket.disconnect();
            return;
        }
        Err(err) => {
            info!("Error querying database: {:?}", err);
            let _ = socket.disconnect();
            return;
        }
    };

    // Validate the session
    if !validate_session(user.id, user.session_key, session) {
        info!("Invalid session, rejecting connection.");
        let _ = socket.disconnect();
        return;
    }

    // Update the user's socket ID and online status
    let updated_user = users::ActiveModel {
        id: ActiveValue::Set(user.id),
        socket_id: ActiveValue::Set(Some(socket.id.to_string())),
        online: ActiveValue::Set(true),
        ..Default::default()
    };

    if let Err(err) = updated_user.update(db.as_ref()).await {
        info!("Error updating user in database: {:?}", err);
        let _ = socket.disconnect();
        return;
    }

    // Notify the client of successful authentication
    let _ = socket.emit("authenticated", &json!({ "username": username }));

    // Register disconnect handler
    socket.on_disconnect(move |disconnect_socket: SocketRef| {
        let disconnect_state = state.clone();
        async move {
            disconnect_event(disconnect_socket, disconnect_state).await;
        }
    });

    info!("Socket.IO connected: {:?}", socket.id);
}