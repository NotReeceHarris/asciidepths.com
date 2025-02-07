use regex::Regex;
use rustrict::CensorStr;
use ahash::AHashSet;
use once_cell::sync::Lazy;
use serde_json::from_reader;
use std::fs::File;
use std::io::BufReader;
use strsim::levenshtein;

static THRESHOLD: usize = 2;

/// Lazily loaded reserved usernames (loaded once)
static RESERVED_USERNAMES: Lazy<AHashSet<String>> = Lazy::new(|| {
    let file = File::open("reserved_usernames.json").expect("Failed to open reserved_usernames.json");
    let reader = BufReader::new(file);
    let reserved_list: Vec<String> = from_reader(reader).expect("Failed to parse JSON");
    reserved_list.into_iter().collect()
});

/// Precompiled regex patterns
static EMAIL_REGEX: Lazy<Regex> = Lazy::new(|| {
    Regex::new(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$").unwrap()
});

static USERNAME_REGEX: Lazy<Regex> = Lazy::new(|| {
    Regex::new(r"^[a-zA-Z0-9_-]{3,20}$").unwrap()
});

/// Validate email format
pub fn validate_email(email: &str) -> bool {
    EMAIL_REGEX.is_match(email)
}

/// Validate username constraints
pub fn validate_username(username: &str) -> bool {
    if !USERNAME_REGEX.is_match(username) || username.is_inappropriate() {
        return false;
    }

    let normalized = username.trim().to_lowercase();

    if RESERVED_USERNAMES.contains(&normalized) {
        return false;
    }

    for word in RESERVED_USERNAMES.iter() {
        if normalized.contains(word) || levenshtein(&normalized, word) <= THRESHOLD {
            return false;
        }
    }

    true
}
