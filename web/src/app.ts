import { writeText, clearScreen } from "./utils/tools";
import Colours from "./constants/colours.json";
import WebSocket from "./utils/websocket";
import type Clock from "./clock";

export default async function app(context: CanvasRenderingContext2D, clock: Clock) {

    const centerX = context.canvas.width / 2;
    const centerY = context.canvas.height / 2;

    clock.addProcess('landing-loading', (ctx, memory) => {

        if (memory.dots === undefined) {
            memory.dots = 0;
        };

        ctx.fillStyle = Colours['battleship-grey'];
        writeText(ctx, 'Ascii Depths', centerX, centerY, null, true, '300px Alucrads');
        writeText(ctx, `Connecting to server${'.'.repeat(memory.dots)}`, centerX - 550, centerY + 60, null, false, '40px Inconsolata');
        if (memory.dots === 4) {memory.dots = 0} else memory.dots++;

    }, 0);

    await new Promise((resolve) => setTimeout(resolve, 2000));
    const ws = new WebSocket('ws://localhost:8008');

    ws.socket.addEventListener("open", async (event) => {
        clock.removeProcess('landing-loading');
        clock.stop();

        clearScreen(context);
        context.fillStyle = Colours['battleship-grey'];
        writeText(context, 'Ascii Depths', centerX, centerY, null, true, '300px Alucrads');
        writeText(context, 'Connected!', centerX - 550, centerY + 60, null, false, '40px Inconsolata');

        await new Promise((resolve) => setTimeout(resolve, 2000));

        clock.addProcess('landing-loading', (ctx, memory) => {

            if (memory.dots === undefined) {
                memory.dots = 0;
            };
    
            ctx.fillStyle = Colours['battleship-grey'];
            writeText(ctx, 'Ascii Depths', centerX, centerY, null, true, '300px Alucrads');
            writeText(ctx, `Authenticating ${'.'.repeat(memory.dots)}`, centerX - 550, centerY + 60, null, false, '40px Inconsolata');
            if (memory.dots === 4) {memory.dots = 0} else memory.dots++;
    
        }, 0);

        clock.start();

    });

}