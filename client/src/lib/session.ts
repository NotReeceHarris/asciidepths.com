import { PUBLIC_SERVER_ADDRESS } from '$env/static/public';
import type { Cookies } from '@sveltejs/kit';

export async function validateSession(cookies: Cookies): Promise<boolean> {
    const sessionCookie = cookies.get('session');

    if (!sessionCookie) {
        return false;
    }

    const [username, session] = sessionCookie.split(':');

    try {
        const response = await fetch(`${PUBLIC_SERVER_ADDRESS}/auth/validate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ session, username }),
        });

        const data = await response.json();

        if (data.success) {
            return true;
        }

        // If validation fails, delete the session cookie
        cookies.delete('session', { path: '/' });
    } catch (error) {
        console.error('Session validation failed:', error);
    }

    return false;
}