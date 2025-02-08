import io from 'socket.io-client';
import { PUBLIC_SERVER_ADDRESS } from '$env/static/public';
import type { Socket } from 'socket.io-client';

/**
 * Encodes a string to a base64 URL-safe format.
 * @param string - The string to encode.
 * @returns The base64 URL-safe encoded string.
 */
function base64URLencode(string: string): string {
    return btoa(string)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

/**
 * Checks if the server is online.
 * @returns A promise that resolves to `true` if the server is online, otherwise `false`.
 */
export async function isOnline(): Promise<boolean> {
    try {
        const response = await fetch(PUBLIC_SERVER_ADDRESS, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (typeof data.online !== 'boolean') {
            throw new Error('Invalid server response: "online" field missing or invalid');
        }

        return data.online;
    } catch (error) {
        console.error('Failed to check server status:', error);
        return false;
    }
}

/**
 * Connects to the server using a session token.
 * @param session - The session token in the format `username:payload`.
 * @returns The connected Socket.IO socket instance.
 */
export function connect(session: string): Socket {
    const [username, payload] = session.split(':');

    if (!username || !payload) {
        throw new Error('Invalid session format. Expected "username:payload".');
    }

    const token = base64URLencode(`${username}:${payload}`);

    return io(PUBLIC_SERVER_ADDRESS, {
        transports: ['websocket'],
        autoConnect: true,
        reconnection: true,
        extraHeaders: {
            authorization: `Bearer ${token}`,
        },
        query: {
            token
        }
    });
}