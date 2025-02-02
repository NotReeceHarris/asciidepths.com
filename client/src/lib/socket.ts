import io from 'socket.io-client';
import { PUBLIC_SERVER_ADDRESS } from '$env/static/public';
import type { Socket } from 'socket.io-client';

function base64URLencode(string: string): string {
    const base64Encoded = btoa(string);
    return base64Encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function connect(session: string): Socket {

    const [username, payload] = session.split(':');
    const token = base64URLencode(`${username}:${payload}`);

    return io(PUBLIC_SERVER_ADDRESS, {
        autoConnect: true,
        reconnection: true,

        extraHeaders: {
            authorization : `Bearer ${token}`
        }
    });
}