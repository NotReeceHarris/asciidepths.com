pub mod index;
pub mod auth;

pub use index::index_handler;

pub use auth::login::login_handler;
pub use auth::register::register_handler;
pub use auth::validate::validate_handler;