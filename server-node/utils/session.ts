import prisma from './prisma';
import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';
import 'dotenv/config';

// Constants for encryption
const RUNTIME_KEY = randomBytes(64).toString('hex'); // Used to validate sessions
const IV_LENGTH = 16; // AES block size is 16 bytes
const ENCRYPTION_ALGORITHM = 'aes-256-cfb'; // Encryption algorithm

/**
 * Encrypts a text using AES-256-CFB.
 * @param text - The text to encrypt.
 * @param key - The encryption key as a Buffer.
 * @returns The encrypted text (IV + encrypted data) or null if encryption fails.
 */
export function encrypt(text: string, key: Buffer): string | null {
    const iv = randomBytes(IV_LENGTH); // Generate a random initialization vector

    try {
        const cipher = createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
        const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
        return `${iv.toString('hex')}$${encrypted.toString('hex')}`; // Combine IV and encrypted text
    } catch (error) {
        console.error('Encryption failed:', error);
        return null;
    }
}

/**
 * Decrypts a text using AES-256-CFB.
 * @param text - The encrypted text (IV + encrypted data).
 * @param key - The decryption key as a Buffer.
 * @returns The decrypted text or null if decryption fails.
 */
export function decrypt(text: string, key: Buffer): string | null {
    try {
        const [ivHex, encryptedHex] = text.split('$'); // Split IV and encrypted text
        if (!ivHex || !encryptedHex) throw new Error('Invalid encrypted text format');

        const iv = Buffer.from(ivHex, 'hex'); // Convert IV from hex to Buffer
        const encrypted = Buffer.from(encryptedHex, 'hex');
        const decipher = createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
        const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
        return decrypted.toString('utf8');
    } catch (error) {
        console.error('Decryption failed:', error);
        return null;
    }
}

/**
 * Generates an encrypted session payload for a user.
 * @param id - The user's ID.
 * @returns The encrypted payload or null if the user is not found.
 */
export async function generateSessionPayload(id: string): Promise<string | null> {
    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            username: true,
            encryptionKey: true,
        },
    });

    if (!user) return null;

    const payload = JSON.stringify({
        id: user.id,
        username: user.username,
        key: RUNTIME_KEY, // Include the runtime key for validation
    });

    return encrypt(payload, Buffer.from(user.encryptionKey, 'hex'));
}

/**
 * Validates a session payload and extracts user data.
 * @param payload - The encrypted session payload.
 * @param key - The decryption key as a hex string.
 * @returns The user data (id and username) or null if validation fails.
 */
export async function validateSessionPayload(payload: string, key: string): Promise<{ id: string; username: string } | null> {
    const decrypted = decrypt(payload, Buffer.from(key, 'hex'));
    if (!decrypted) return null;

    try {
        const { id, username, key: payloadKey } = JSON.parse(decrypted);

        // Validate the runtime key in production
        if (process.env.NODE_ENV === 'production' && payloadKey !== RUNTIME_KEY) {
            return null;
        }

        return { id, username };
    } catch (error) {
        console.error('Failed to parse decrypted payload:', error);
        return null;
    }
}