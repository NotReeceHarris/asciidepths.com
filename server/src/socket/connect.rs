use socketioxide::extract::SocketRef;
use tracing::info;

use crate::constants::ALLOWED_ORIGIN;
use crate::structs::AppState;

pub async fn connect_event(socket: SocketRef, state: AppState/* , Data(data): Data<Value> */) {
    let headers = &socket.req_parts().headers;
    let origin = headers.get("Origin").and_then(|v| v.to_str().ok());

    // Validate the Origin
    if origin != Some(ALLOWED_ORIGIN) {
        info!("Rejected connection from origin: {:?}", origin);
        socket.disconnect().ok();
        return;
    }

    let _db = &state.db; // Access the database connection
    info!("Socket.IO connected: {:?}", socket.id);
}