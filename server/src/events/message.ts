import { isValidJSON } from "../utils/validation";
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

import type { Client } from "../types";
import type { RawData } from 'ws';

const prisma = new PrismaClient();

export default async function onMessage(client: Client, rawData: RawData) {
    const message = rawData.toString();
        
    if (message === "ping") {
        client.ws.send("pong");
        return;
    }

    // Parse and validate the incoming message
    if (!isValidJSON(message)) return;

    const json = JSON.parse(message);
    if (!json.type) return;

    client.lastContact = Date.now();

    switch (json.type) {
        case "auth":

            if (client.authenticated) return;
            if (client.authRatelimit > 5) return;
            client.authRatelimit++;

            if (!json.email && !json.password) return;

            const user = await prisma.user.findUnique({
                where: {
                    email: json.email,
                },
            });

            if (!user) {
                return client.ws.send(JSON.stringify({ type: "auth", success: false }));
            };

            console.log(await bcrypt.compare(json.password, user.password))

            if (!await bcrypt.compare(json.password, user.password)) {
                return client.ws.send(JSON.stringify({ type: "auth", success: false }));
            }

            const authToken = crypto.randomBytes(32).toString('hex');
            return client.ws.send(JSON.stringify({ 
                type: "auth", 
                success: true,
                authToken: authToken,
                username: user.username
            }));

            break;
        default:
            console.error("Unknown message type:", json.type);
    }
}