import { writeText } from "./utils/text";
import Colours from "./constants/colours.json";
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

}