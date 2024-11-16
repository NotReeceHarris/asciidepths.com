import { writeText } from "./utils";
import Colours from "./constants/colours.json";
import type Clock from "./clock";

export default async function app(context: CanvasRenderingContext2D, clock: Clock) {
    context.fillStyle = Colours['battleship-grey'];

    const centerX = context.canvas.width / 2;
    const centerY = context.canvas.height / 2;

    clock.addProcess('landing-loading', (ctx, memory) => {
        if (memory.dots === undefined) {
            memory.dots = 0;
            if (typeof self !== 'undefined' && typeof self.postMessage === 'function') console.log('This is running in a Web Worker!');
        };

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        writeText(ctx, 'Ascii Depths', centerX, centerY, 900, true, '120px Alucrads');
        writeText(ctx, `Connecting to server${'.'.repeat(memory.dots)}`, centerX - 220, centerY + 25, 900, false, '20px Inconsolata');

        if (memory.dots === 4) {memory.dots = 0} else memory.dots++;
    }, 0);

}