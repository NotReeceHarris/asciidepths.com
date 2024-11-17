import { WebSocketServer } from "ws";
import { v4 as uuidv4 } from 'uuid';
import { encode } from "./utils/encoder";

const port = 8008;
const wss = new WebSocketServer({ port });
const clients = new Map();

console.log(`WebSocket server is running on ws://localhost:${port}`);

wss.on("connection", (ws) => {
    console.log("A new client connected");
    
    const clientId = uuidv4();
    clients.set(clientId, ws);

    ws.send(encode({ type: "clientId", clientId }));

    ws.on("message", (message) => {
        console.log(`Received message: ${message}`);
    });

    ws.on("close", () => {
        console.log("A client disconnected");
    });
});
