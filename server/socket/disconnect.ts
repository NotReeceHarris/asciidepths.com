import prisma from '../utils/prisma';
import { Server, Socket } from 'socket.io';

interface User {
    id: string;
}

/**
 * Updates the user's online status to `false` when they disconnect.
 * @param io - The Socket.IO server instance.
 * @param socket - The Socket.IO socket instance.
 * @param user - The user object containing the user's ID.
 */
export default async function handleUserDisconnect(
    io: Server,
    socket: Socket,
    user: User
): Promise<void> {

    socket._cleanup();
    socket.disconnect(true);
    socket.removeAllListeners();
    socket.offAny();

    try {
        // Update the user's online status to false
        await prisma.user.update({
            where: { id: user.id },
            data: { online: false },
        });

        console.log('User disconnected:', user.id);
    } catch (error) {
        console.error('Failed to update user online status:', error);
    }
}