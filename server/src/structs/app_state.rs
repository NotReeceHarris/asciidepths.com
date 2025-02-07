use sea_orm::DatabaseConnection;
use std::{sync::{Arc, Mutex}, collections::VecDeque};

const STATIC_CACHE_SIZE: usize = 200; // Fixed-size cache for static data
const _DYNAMIC_CACHE_SIZE: usize = 200; // Fixed-size cache for dynamic data

#[derive(Clone)]
pub struct AppState {
    pub db: Arc<DatabaseConnection>,  // Database connection
    pub denied_username_cache: Arc<Mutex<VecDeque<String>>>, // Cache for denied usernames
}

impl AppState {
    pub fn new(db: DatabaseConnection) -> Self {
        Self {
            db: Arc::new(db),
            denied_username_cache: Arc::new(Mutex::new(VecDeque::with_capacity(STATIC_CACHE_SIZE))),
        }
    }

    // Cache for denied usernames, used to quickly reject invalid usernames
    // - This cache is used to quickly reject invalid usernames without doing costly operations

    /// Check if a username is in the cache
    pub fn is_denied_username_cached(&self, username: &String) -> bool {
        let cache = self.denied_username_cache.lock().unwrap();
        cache.contains(username)
    }

    /// Add a denied username to the cache (removing the oldest if full)
    pub fn cache_denied_username(&self, username: String) {
        let mut cache = self.denied_username_cache.lock().unwrap();
        if cache.len() >= STATIC_CACHE_SIZE {
            cache.pop_front(); // Remove oldest entry
        }
        cache.push_back(username);
    }
}
