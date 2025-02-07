import { createServer } from 'node:http';
import { Server } from 'socket.io';
import express from 'express';
import cors from 'cors';
import prisma from './utils/prisma';

import connectionEvent from './socket/connection';
import registerRoute from './routes/register';
import loginRoute from './routes/login';
import validateRoute from './routes/validate';
import indexRoute from './routes/index';

// CORS configuration for Express and Socket.IO
const corsOptions = {
    origin: 'http://localhost:5173', // Allow only this origin
    methods: ['GET', 'POST'], // Allowed HTTP methods
    credentials: true, // Allow credentials
};

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: corsOptions,
    maxHttpBufferSize: 1 * 1024 * 1024, // 1 MB in bytes
});

// Middleware
app.use(express.json());
app.use(cors(corsOptions));

// Routes
app.use('/', indexRoute);
app.use('/auth/register', registerRoute);
app.use('/auth/login', loginRoute);
app.use('/auth/validate', validateRoute);

// Socket.IO connection handling
io.on('connection', (socket) => {
    connectionEvent(io, socket);
});

// Start the server
const startServer = async () => {
    try {
        // Reset all users' online status to false
        await prisma.user.updateMany({
            where: { online: true },
            data: { online: false },
        });
        console.log('All users set to offline');

        // Start listening on port 3000
        server.listen(3000, () => {
            console.log('Server running at http://localhost:3000');
        });
    } catch (error) {
        console.error('Failed to set all users to offline:', error);
    }
};

startServer();