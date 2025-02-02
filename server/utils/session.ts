import prisma from './prisma';
import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';
import 'dotenv/config';

// Used to determine if a session is valid
const RUNTIME_KEY = randomBytes(64).toString('hex');
const IV_LENGTH = 16; // AES block size is 16 bytes

export function encrypt(text: string, key: Buffer): string | null {
    const iv = randomBytes(IV_LENGTH); // Generate a random initialization vector

    try {
        const cipher = createCipheriv('aes-256-cfb', key, iv);
        const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
        return `${iv.toString('hex')}$${encrypted.toString('hex')}`; // Combine IV and encrypted text
    } catch (error) {
        console.error('Encryption failed:', error); // Log the error for debugging
        return null;
    }
}

export function decrypt(text: string, key: Buffer): string | null {
    try {
        const [ivHex, encryptedHex] = text.split('$'); // Split IV and encrypted text
        if (!ivHex || !encryptedHex) throw new Error('Invalid encrypted text format');

        const iv = Buffer.from(ivHex, 'hex'); // Convert IV from hex to Buffer
        const encrypted = Buffer.from(encryptedHex, 'hex');
        const decipher = createDecipheriv('aes-256-cfb', key, iv);
        const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
        return decrypted.toString('utf8');
    } catch (error) {
        console.error('Decryption failed:', error); // Log the error for debugging
        return null;
    }
}

export async function generateSessionPayload(id: number): Promise<string | null> {
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
        key: RUNTIME_KEY,
    });

    return encrypt(payload, Buffer.from(user.encryptionKey, 'hex'));
}

export async function validateSessionPayload(payload: string, key: string): Promise<{ id: number; username: string } | null> {
    const decrypted = decrypt(payload, Buffer.from(key, 'hex'));
    if (!decrypted) return null;

    try {
        const { id, username, key } = JSON.parse(decrypted);

        if (process.env.ENV === 'production' && key !== RUNTIME_KEY) {
            return null;
        }

        return { id, username };
    } catch (error) {
        console.error('Failed to parse decrypted payload:', error);
        return null;
    }
}