import express, { Request, Response } from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import cors from 'cors';
import { validateEmail, validateUsername } from './utils/validation';
import prisma from './utils/prisma';
import argon2 from 'argon2';
import { randomBytes } from 'crypto';
import { generateSessionPayload, validateSessionPayload } from './utils/session';
import base64url from "base64url";
import fs from 'fs';

// Set all users to offline on server start
prisma.user.updateMany({
    where: { online: true },
    data: { online: false },
}).then(() => {
    console.log('All users set to offline');
}).catch((error) => {
    return null
})

const app = express();
const server = createServer(app);

// Middleware to parse JSON requests
app.use(express.json());

// CORS configuration for Express and Socket.IO
const corsOptions = {
    origin: 'http://localhost:5173', // Allow only this origin
    methods: ['GET', 'POST'], // Allowed HTTP methods
    credentials: true, // Allow credentials
};

app.use(cors(corsOptions));

const io = new Server(server, {
    cors: corsOptions,
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Hello World' });
});

// Login endpoint
app.post('/auth/login', async (req: Request, res: Response): Promise<any> => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, errors: ['Incorrect email or password.'] });
    }

    if (!validateEmail(email)) {
        return res.status(400).json({ success: false, errors: ['Invalid email format.'] });
    }

    const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, username: true, password: true },
    }).catch((error) => {
        return null
    })

    if (!user || !(await argon2.verify(user.password, password))) {
        return res.status(400).json({ success: false, errors: ['Incorrect email or password.'] });
    }

    const session = await generateSessionPayload(user.id);
    res.status(200).json({ success: true, session, username: user.username });
});

// Register endpoint
app.post('/auth/register', async (req: Request, res: Response): Promise<any> => {
    let { email, username, password } = req.body;
    username = username?.trim().toLowerCase();

    const errors: string[] = [];

    if (!email) errors.push('Email is required');
    if (!username) errors.push('Username is required');
    if (!password) errors.push('Password is required');

    if (errors.length > 0) {
        return res.status(400).json({ success: false, errors });
    }

    if (!validateEmail(email)) {
        return res.status(400).json({ success: false, errors: ['Invalid email format.'] });
    }

    const usernameValidation = validateUsername(username);
    if (!usernameValidation.isValid) {
        return res.status(400).json({ success: false, errors: [usernameValidation.message] });
    }

    const existingUser = await prisma.user.findFirst({
        where: { OR: [{ email }, { username }] },
        select: { id: true, email: true, username: true },
    }).catch((error) => {
        return null
    })

    if (existingUser) {
        if (existingUser.email === email) errors.push('Email already in use.');
        if (existingUser.username === username) errors.push('Username already in use.');
        return res.status(400).json({ success: false, errors });
    }

    const user = await prisma.user.create({
        data: {
            email,
            username,
            password: await argon2.hash(password),
            encryptionKey: randomBytes(32).toString('hex'),
            location: {
                connect: {
                    name: 'stonestoryrpg.com'
                }
            },
            posx: 0,
            posy: 0,
        },
    }).catch((error) => {
        return null
    })

    if (!user) {

        await prisma.user.delete({
            where: { email }
        }).catch((error) => {
            return null
        })

        return res.status(500).json({ success: false, errors: ['Failed to create user.'] });
    }

    const session = await generateSessionPayload(user.id);
    res.status(200).json({ success: true, session, username: user.username });
});

app.post('/auth/validate', async (req: Request, res: Response): Promise<any> => {

    const { session, username } = req.body;

    if (!session || !username) {
        return res.status(400).json({ success: false, errors: ['Invalid session.'] });
    }

    const user = await prisma.user.findUnique({
        where: { 
            username: username.trim()
        },
        select: { 
            id: true, 
            encryptionKey: true 
        },
    }).catch((error) => {
        return null
    })

    if (!user) {
        return res.status(400).json({ success: false, errors: ['Invalid session'] });
    }

    const valid = await validateSessionPayload(session, user.encryptionKey);

    if (!valid) {
        return res.status(400).json({ success: false, errors: ['Invalid session'] });
    }

    res.status(200).json({ success: true, username });
});

const mapCache = new Map();
function getMap(id: string, name: string): {
    background: string,
    highlight: string,
    floor: string,
    foreground: string,
} {
    if (mapCache.has(id)) {
        return mapCache.get(id)
    }

    const background = fs.readFileSync(`./maps/${name}/background.txt`, 'utf8');
    const highlight = fs.readFileSync(`./maps/${name}/highlight.txt`, 'utf8');
    const floor = fs.readFileSync(`./maps/${name}/floor.txt`, 'utf8');
    const foreground = fs.readFileSync(`./maps/${name}/foreground.txt`, 'utf8');

    mapCache.set(id, { background, highlight, floor, foreground });
    return { background, highlight, floor, foreground };
}

// Socket.IO connection handling
io.on('connection', async (socket) => {
    console.log('a user connected');

    const authorization = socket.handshake.headers.authorization;

    if (!authorization || !authorization.startsWith('Bearer ')) {
        return socket.disconnect();;
    }

    const decoded = base64url.decode(authorization.split(' ')[1]);
    const [username, payload] = decoded.split(':');
    
    if (!username || !payload) {
        return socket.disconnect();;
    }

    const user = await prisma.user.findUnique({
        where: { 
            username: username.trim()
        },
        select: { 
            id: true, 
            encryptionKey: true ,
            location: {
                select: {
                    id: true,
                    name: true,
                }
            },
            posx: true,
            posy: true,
            online: true,
        },
    }).catch((error) => {
        return null
    })

    if (!user) {
        return socket.disconnect();;
    }

    const valid = await validateSessionPayload(payload, user.encryptionKey);

    if (!valid) {
        return socket.disconnect();;
    }

    if (valid.username !== username || valid.id !== user.id) {
        return socket.disconnect();;
    }

    if (user.online) {
        console.log('user already online');
        return socket.disconnect();;
    }

    await prisma.user.update({
        where: { id: user.id },
        data: {
            online: true,
        },
    }).catch((error) => {
        return null
    })

    console.log(`user authenticated as "${username}"`);

    socket.send({
        event: 'authenticated',
        data: { 
            username,
        },
    });

    socket.send({
        event: 'location',
        data: { 
            location: user.location.name,
            map: getMap(user.location.id.toString(), user.location.name),
        },
    })

    socket.send({
        event: 'position',
        data: { 
            x: user.posx,
            y: user.posy,
        },
    });

    const users_in_location = await prisma.user.findMany({
        where: {
            locationId: user.location.id,
            online: true,
        },
        select: {
            username: true,
            posx: true,
            posy: true,
        }
    }).catch((error) => {
        return null
    })

    if (users_in_location && users_in_location.length > 0) {
        socket.send({
            event: 'user_enter_sight',
            data: {
                users: users_in_location,
            },
        });
    }

    socket.join(`location-${user.location.id}`);

    io.to(`location-${user.location.id}`).emit('message', {
        event: 'users_in_location_update',
        data: {
            users:[
                {
                    username,
                    posx: user.posx,
                    posy: user.posy,
                }
            ]
        },
    });

    socket.on('message', (data) => {
        console.log(data);
        io.emit('message', data);
    });

    socket.on('move', (data) => {
        const { x, y } = data;

        prisma.user.update({
            where: { id: user.id },
            data: {
                posx: {
                    increment: x,
                },
                posy: {
                    increment: y,
                },
            },
        }).then((me) => {
            io.to(`location-${user.location.id}`).emit('message', {
                event: 'users_in_location_update',
                data: {
                    users:[
                        {
                            username,
                            posx: me.posx,
                            posy: me.posy,
                        }
                    ]
                },
            });
        }).catch((error) => {
            return null
        })
    });

    socket.on('disconnect', async () => {
        await prisma.user.update({
            where: { id: user.id },
            data: {
                online: false,
            },
        }).catch((error) => {
            return null
        })

        console.log('user disconnected');
    });

    socket.on('close', () => {
        console.log('closing connection');
    });
});

// Start the server
server.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});