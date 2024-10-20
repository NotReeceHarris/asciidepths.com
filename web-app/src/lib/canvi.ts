export function clearScreen(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#121212';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

let sizeX: number;
let sizeY: number;
let prevFrame: string[][];

/* 
    This function takes in a frame, and a text elemtn and places the top left of the element at the x, y coordinates
    of the canvas. It returns the new frame with the text element placed on it. the text element may  have multiple lines or 
    have multiple characters per line.

    center boolean places the element at X, Y coordinate however it sets the element origin to the center of the element
*/
export function place(frame: string[][], text: string | string[], X: number, Y: number, center: boolean = false): string[][] {

    if (typeof text === 'object') {
        text = text[0]
    }

    let lines = text.split('\n');
    let newFrame = frame;

    if (center) {
        X = X - Math.floor(lines[0].length / 2);
        Y = Y - Math.floor(lines.length / 2) + 1;
    }

    for (let y = 0; y < lines.length; y++) {
        const line = lines[y];

        for (let x = 0; x < line.length; x++) {
            const char = line.split('')[x];

            if (char == '╶') {
                continue;
            }

            if (Y + y < 0 || Y + y >= frame.length) {
                continue;
            }

            frame[Y + y][X + x] = char;
        }

    }

    return newFrame;
}

export function update(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, frame: string[][]): void {

    if (!canvas || !ctx || !frame) {
        console.log('Canvas or context not found');
        return;
    }

    if (prevFrame === frame) {
        return;
    }

    // Save the frame so we can compare it next time, have to do this because arrays are passed by reference
    prevFrame = JSON.parse(JSON.stringify(frame));

    clearScreen(ctx);

    const size = 25;
    ctx.font = `${size}px Courier New`;
    ctx.fillStyle = "#c9c9c9";

    for (let y = 0; y < frame.length; y++) {
        if (!frame[y]) {
            break;
        }
        let line = frame[y].join('');
        ctx.fillText(line, size / 3, ((y * size) + (size/1.2)));
    }
}