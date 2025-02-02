import { writeText } from "./utils/tools";
import Colours from "./constants/colours.json";
import WebSocket from "./utils/websocket";
import { email, password, login, div, error } from "./utils/html";

import type Clock from "./utils/clock";

let authToken: string | null = null;

export default async function app(context: CanvasRenderingContext2D, clock: Clock) {

    const centerX = context.canvas.width / 2;
    const centerY = context.canvas.height / 2;

    // Loading screen
    clock.addProcess('loading', (ctx, memory) => {
        if (memory.dots === undefined || memory.dots === 3) {memory.dots = 0} else memory.dots++;

        ctx.fillStyle = Colours['battleship-grey'];
        writeText(ctx, 'Ascii Depths', centerX + 20, centerY, null, true, '300px Alucrads');
        writeText(ctx, `Connecting to server${'.'.repeat(memory.dots)}`, centerX - 550, centerY + 60, null, false, '40px Inconsolata');
    }, 0);

    const ws = new WebSocket('ws://localhost:8008');

    const sendAuth = () => {
        ws.socket.send(JSON.stringify({ 
            type: 'auth', 
            email: email.value, 
            password: password.value 
        }));
    };

    // Close event
    ws.addEventListener("close", async () => {

        // Remove input fields
        email.remove();
        password.remove();
        login.remove();
        error.remove();

        // Loading screen
        clock.start();
        clock.addProcess('loading', (ctx, memory) => {
            if (memory.dots === undefined || memory.dots === 3) {memory.dots = 0} else memory.dots++;
    
            ctx.fillStyle = Colours['battleship-grey'];
            writeText(ctx, 'Ascii Depths', centerX + 20, centerY, null, true, '300px Alucrads');
            writeText(ctx, `Connection lost, Reconnecting${'.'.repeat(memory.dots)}`, centerX - 550, centerY + 60, null, false, '40px Inconsolata');
        }, 0);
    });

    // Open event
    ws.addEventListener("open", async (event) => {
        clock.stop();
        clock.removeProcess('loading');

        context.fillStyle = Colours['battleship-grey'];
        writeText(context, 'Ascii Depths', centerX + 20, centerY, null, true, '300px Alucrads');

        // Create input field
        document.body.appendChild(email);
        document.body.appendChild(password);
        document.body.appendChild(login);

        login.removeEventListener('click', sendAuth);
        login.addEventListener('click', sendAuth);

        ws.addEventListener('message', (event: any) => {
            
            try {
                JSON.parse(event.data);
            } catch (error) {
                return;
            }

            const json = JSON.parse(event.data);

            if (!json.type) return;
            if (json.type !== 'auth') return;
            if (json.success === false) return document.body.appendChild(error);

            // Remove input fields
            email.remove();
            password.remove();
            login.remove();
            error.remove();

            authToken = json.authToken;

            // Loading screen
            clock.start();
            clock.addProcess('loading', (ctx, memory) => {
                if (memory.dots === undefined || memory.dots === 3) {memory.dots = 0} else memory.dots++;
        
                ctx.fillStyle = Colours['battleship-grey'];
                writeText(ctx, 'Ascii Depths', centerX + 20, centerY, null, true, '300px Alucrads');
                writeText(ctx, `Logged in, loading${'.'.repeat(memory.dots)}`, centerX - 550, centerY + 60, null, false, '40px Inconsolata');
            }, 0);

        });

    });

}