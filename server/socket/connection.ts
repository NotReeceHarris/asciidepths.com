import prisma from '../utils/prisma';
import { validateSessionPayload } from '../utils/session';
import base64url from 'base64url';
import { getMap } from '../utils/map';
import { Server, Socket } from 'socket.io';

import disconnect from './disconnect';
import move from './move';

/**
 * Handles a new socket connection, authenticates the user, and sets up event listeners.
 * @param io - The Socket.IO server instance.
 * @param socket - The Socket.IO socket instance.
 */
export default async function handleConnection(io: Server, socket: Socket): Promise<void> {
    console.log('A user connected');

    const authorization = socket.handshake.headers.authorization;

    // Validate authorization header
    if (!authorization || !authorization.startsWith('Bearer ')) {
        return void socket.disconnect();
    }

    // Decode the authorization payload
    const decoded = base64url.decode(authorization.split(' ')[1]);
    const [username, payload] = decoded.split(':');

    if (!username || !payload) {
        return void socket.disconnect();
    }

    // Fetch the user from the database
    const user = await prisma.user.findUnique({
        where: { username: username.trim() },
        select: {
            id: true,
            username: true,
            encryptionKey: true,
            location: {
                select: {
                    id: true,
                    name: true,
                },
            },
            posx: true,
            posy: true,
            online: true,
        },
    }).catch((error) => {
        console.error('Failed to fetch user:', error);
        return null;
    });

    if (!user) {
        return void socket.disconnect();
    }

    // Validate the session payload
    const valid = await validateSessionPayload(payload, user.encryptionKey);

    if (!valid || valid.username !== username || valid.id !== user.id) {
        return void socket.disconnect();
    }

    // Check if the user is already online
    if (user.online) {
        console.log('User already online:', user.username);
        return void socket.disconnect();
    }

    // Send authentication success message
    socket.send({
        event: 'authenticated',
        data: { username },
    });

    // Send location and map data
    socket.send({
        event: 'location',
        data: {
            location: user.location.name,
            map: getMap(user.location.id.toString(), user.location.name),
        },
    });

    // Send initial position data
    socket.send({
        event: 'position',
        data: {
            x: user.posx,
            y: user.posy,
        },
    });

    // Update the user's online status
    await prisma.user.update({
        where: { id: user.id },
        data: { online: true },
    }).catch((error) => {
        console.error('Failed to update user online status:', error);
    });

    // Join the user to their location room
    socket.join(`location-${user.location.id}`);

    // Notify other users in the location about the new user
    io.to(`location-${user.location.id}`).emit('message', {
        event: 'users_in_location_update',
        data: {
            users: [
                {
                    username: user.username,
                    posx: user.posx,
                    posy: user.posy,
                },
            ],
        },
    });

    // Set up event listeners
    socket.on('message', (data) => {
        console.log('Received message:', data);
        io.emit('message', data);
    });

    socket.on('move', (data) => {
        move(io, socket, user, data);
    });

    socket.on('disconnect', () => {
        disconnect(io, socket, user);
    });
}