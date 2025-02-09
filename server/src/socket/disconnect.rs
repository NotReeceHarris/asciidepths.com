use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine};
use socketioxide::extract::SocketRef;
use tracing::info;
use sea_orm::*;

use crate::structs::AppState;
use crate::entities::{prelude::*, *};

pub async fn disconnect_event(socket: SocketRef, state: AppState) {
    let db = &state.db; // Access the database
    let id = socket.id.to_string();

    info!("Socket.IO disconnected: {:?}", id);

    // Find the user by socket ID
    let user = match Users::find()
        .filter(users::Column::SocketId.eq(&id))
        .one(db.as_ref())
        .await
    {
        Ok(Some(user)) => user,
        Ok(None) => {
            info!("No user found with socket ID: {:?}", id);
            return;
        }
        Err(err) => {
            info!("Error querying database: {:?}", err);
            return;
        }
    };

    // Update the user's socket ID and online status
    let updated_user = users::ActiveModel {
        id: ActiveValue::Set(user.id),
        socket_id: ActiveValue::Set(None),
        online: ActiveValue::Set(false),
        ..Default::default()
    };

    if let Err(err) = updated_user.update(db.as_ref()).await {
        info!("Error updating user in database: {:?}", err);
    }
}