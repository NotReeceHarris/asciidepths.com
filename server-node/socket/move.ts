import prisma from '../utils/prisma';
import { Server, Socket } from 'socket.io';

interface User {
    id: string;
    username: string;
    location: {
        id: string;
    };
}

interface PositionData {
    x: number;
    y: number;
}

/**
 * Updates the user's position and broadcasts the update to all users in the same location.
 * @param io - The Socket.IO server instance.
 * @param socket - The Socket.IO socket instance.
 * @param user - The user object containing ID, username, and location.
 * @param data - The position data containing `x` and `y` offsets.
 */
export default async function updateUserPosition(
    io: Server,
    socket: Socket,
    user: User,
    data: PositionData
): Promise<void> {
    const { x, y } = data;

    try {
        // Update the user's position in the database
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                posx: { increment: x },
                posy: { increment: y },
            },
        });

        // Broadcast the updated position to all users in the same location
        io.to(`location-${user.location.id}`).emit('message', {
            event: 'users_in_location_update',
            data: {
                users: [
                    {
                        username: user.username,
                        posx: updatedUser.posx,
                        posy: updatedUser.posy,
                    },
                ],
            },
        });
    } catch (error) {
        console.error('Failed to update user position:', error);
    }
}