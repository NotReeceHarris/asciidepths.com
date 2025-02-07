pub mod login;
pub mod register;
pub mod validate;

// Re-export the handlers for easy access
pub use login::login_handler;
pub use register::register_handler;
pub use validate::validate_handler;