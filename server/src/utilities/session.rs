use aes_gcm::{AeadInPlace, Aes256Gcm, Key, KeyInit, Nonce};
use aes_gcm::aead::generic_array::GenericArray;
use rand::RngCore;
use hex;

/// Generates a random 256-bit (32-byte) AES key and returns it as a hex string
pub fn generate_session_key() -> String {
    let mut key = [0u8; 32]; // 256-bit key (AES-256)
    rand::thread_rng().fill_bytes(&mut key);
    hex::encode(key) // Convert to hex string
}

pub fn generate_session(user_id: i32, username: String, session_key: String) -> String {
    // Convert hex session_key to bytes
    let key_bytes = hex::decode(session_key).expect("Invalid hex key");
    
    // Ensure the key is 32 bytes (AES-256)
    assert_eq!(key_bytes.len(), 32, "Key must be 32 bytes (64 hex characters)");
    
    // Convert key bytes to AES key
    let key = Key::<Aes256Gcm>::from_slice(&key_bytes);
    let cipher = Aes256Gcm::new(key);

    // Generate a random 12-byte IV (nonce)
    let mut nonce_bytes = [0u8; 12];
    rand::thread_rng().fill_bytes(&mut nonce_bytes);
    let nonce = Nonce::from_slice(&nonce_bytes);

    // Convert `user_id` to bytes (4 bytes for i32)
    let user_id_bytes = user_id.to_le_bytes();

    // Encrypt user_id
    let mut encrypted_data = user_id_bytes.to_vec();
    cipher.encrypt_in_place(nonce, b"", &mut encrypted_data).expect("Encryption failed");

    // Concatenate IV + Encrypted Data
    let mut final_data = nonce_bytes.to_vec();
    final_data.extend_from_slice(&encrypted_data);

    // Convert to hex
    let hex_encrypted = hex::encode(final_data);

    // Return in format: `username:HEX(IV + Encrypted user_id)`
    format!("{}:{}", username, hex_encrypted)
}


pub fn validate_session(user_id: i32, session_key: String, session: String) -> bool {
    // Extract the encrypted hex part after the username
    let hex_encrypted = session;

    // Decode session_key from hex
    let key_bytes = match hex::decode(session_key) {
        Ok(bytes) => bytes,
        Err(_) => return false, // Invalid hex key
    };

    // Ensure the key is 32 bytes (AES-256)
    if key_bytes.len() != 32 {
        return false;
    }

    let key = Key::<Aes256Gcm>::from_slice(&key_bytes);
    let cipher = Aes256Gcm::new(key);

    // Decode the hex-encoded session (IV + Encrypted Data)
    let encrypted_bytes = match hex::decode(hex_encrypted) {
        Ok(bytes) => bytes,
        Err(_) => return false, // Invalid hex data
    };

    // Ensure the session is at least 16 bytes (12-byte IV + 4-byte user_id)
    if encrypted_bytes.len() < 16 {
        return false;
    }

    // Extract IV (nonce) and encrypted user_id
    let nonce_bytes = &encrypted_bytes[..12];
    let mut encrypted_user_id = encrypted_bytes[12..].to_vec();

    let nonce = Nonce::from_slice(nonce_bytes);

    // Decrypt user_id
    let decrypted = cipher.decrypt_in_place(nonce, b"", &mut encrypted_user_id);
    if decrypted.is_err() {
        return false; // Decryption failed
    }

    // Convert decrypted bytes back to i32
    if encrypted_user_id.len() != 4 {
        return false;
    }
    let decrypted_user_id = i32::from_le_bytes(encrypted_user_id.try_into().unwrap());

    // Compare decrypted user_id with provided user_id
    return decrypted_user_id == user_id
}
