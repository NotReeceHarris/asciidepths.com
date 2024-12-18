import { WebSocketServer } from "ws";
import { v4 as uuidv4 } from 'uuid';
import { encode } from "./utils/encoder";
import message from "./events/message";

const port = 8008;
const wss = new WebSocketServer({ port });
const clients = new Map();

console.log(`WebSocket server is running on ws://localhost:${port}`);

wss.on("connection", (ws) => {
    console.log("A new client connected");

    const clientId = uuidv4();
    clients.set(clientId, {
        ws,
        authRatelimit: 0,
        authenticated: false,
        lastContact: Date.now()
    });
    
    // Send the client their ID
    ws.send(encode({ type: "clientId", clientId }));

    ws.on("message", (rawData) => {
        const client = clients.get(clientId);
        message(client, rawData);
    });

    ws.on("close", () => {
        console.log("A client disconnected");
        clearInterval(clients.get(clientId).heartbeat);
        clients.delete(clientId);
    });
});