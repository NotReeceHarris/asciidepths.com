use axum::{
    http::{
        header::{
            HeaderValue, 
            CONTENT_TYPE,
            AUTHORIZATION,
            ORIGIN
        },
        Method
    },
    routing::{
        get, 
        post
    }, 
    Router
};

use tower_http::cors::CorsLayer;

use http::{
    index_handler,
    auth::{
        login_handler, 
        register_handler, 
        validate_handler
    }
};

use socketioxide::extract::SocketRef;
use socketioxide::SocketIo;
use tracing::info;
use tracing_subscriber::FmtSubscriber;
use once_cell::sync::Lazy;
use tokio::signal;
use sea_orm::Database;
use dotenvy::dotenv;

mod entities;
mod constants;
mod utilities;
mod structs;
mod http;
mod socket {pub mod connect; pub mod disconnect;}

// Import handlers, events and constants

use socket::connect::connect_event;
use constants::{ALLOWED_ORIGIN, PORT};
use structs::AppState;

// Lazy static CORS layer
// This ensures the CORS configuration is computed only once at runtime
static CORS: Lazy<CorsLayer> = Lazy::new(|| {
    CorsLayer::new()
        .allow_methods([Method::GET, Method::POST, Method::OPTIONS]) // Allow specific HTTP methods
        .allow_origin(ALLOWED_ORIGIN.parse::<HeaderValue>().unwrap()) 
        //.allow_headers(Any) // Allow all headers
        .allow_headers([
            CONTENT_TYPE,
            AUTHORIZATION,
            ORIGIN
        ])
        .allow_credentials(true) // Allow credentials (Cookies, Authorization headers)
});

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Set up tracing for logging
    tracing::subscriber::set_global_default(FmtSubscriber::default())?;

    // Load environment variables from .env file
    dotenv().ok();

    let db = Database::connect(std::env::var("DATABASE_URL").unwrap()).await?;
    let state = AppState::new(db);

    // Create a new Socket.IO layer and configure the namespace
    let (layer, io) = SocketIo::new_layer();

    // Clone the state for use in the WebSocket closure
    let ws_state = state.clone();

    // Set up the root namespace with the `connect_event` handler
    io.ns("/", move |socket: SocketRef| {
        let state = ws_state.clone();
        async move {
            connect_event(socket, state).await;
        }
    }); 

    // Define the Axum router with routes for the root path and authentication handlers
    let app = Router::new()
        .route("/", get(index_handler))  // Root route
        .route("/auth/login", post(login_handler))              // Login route
        .route("/auth/register", post(register_handler))        // Register route
        .route("/auth/validate", post(validate_handler))        // Validate route
        
        .layer(CORS.clone())    // Add the precomputed CORS layer to the router
        .layer(layer)           // Add the Socket.IO layer to the router
        .with_state(state);     // Add the application state to the router

    #[cfg(debug_assertions)] // Enable server timing middleware in debug mode
    let app = app.layer(miku_server_timing::ServerTimingLayer::new("proccessing time")); 

    // Bind the server to the specified address and port
    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{}", PORT)).await.unwrap();

    // Log server startup information
    info!("Connected to database {}", std::env::var("DATABASE_URL").unwrap());
    info!("Starting server on port {}", PORT);
    info!("Allowed origin: {}", ALLOWED_ORIGIN);
    info!("Socket.IO namespace configured at /");

    // Start the server with graceful shutdown support
    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal()) // Handle graceful shutdown
        .await
        .unwrap();

    Ok(())
}

// Function to handle graceful shutdown
async fn shutdown_signal() {
    
    // Wait for a CTRL+C signal
    signal::ctrl_c()
        .await
        .expect("Failed to install CTRL+C signal handler");

    info!("Shutting down gracefully..."); // Log shutdown message
}