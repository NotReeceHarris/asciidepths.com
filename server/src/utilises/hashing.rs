use argon2::{
    password_hash::{
        rand_core::OsRng, PasswordHasher, PasswordVerifier, SaltString
    },
    Argon2, PasswordHash
};

pub fn hash_password(password: &str) -> String {

    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    let password_hash = match argon2.hash_password(password.as_bytes(), &salt) {
        Ok(password_hash) => password_hash,
        Err(_) => panic!("Failed to hash password")
    };

    password_hash.to_string()
}

pub fn verify_password(password: &str, hash: &str) -> bool {
    let parsed_hash = match PasswordHash::new(hash) {
        Ok(parsed_hash) => parsed_hash,
        Err(_) => panic!("Failed to parse password hash")
    };
    let argon2 = Argon2::default();
    match argon2.verify_password(password.as_bytes(), &parsed_hash) {
        Ok(_) => true,
        Err(_) => false
    }
}