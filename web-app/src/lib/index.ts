import { io } from "socket.io-client";
import * as canvasUtils from "./canvas";

export function init(canvas: HTMLCanvasElement): void {

    // Set the canvas size, and scale it up by 1.2 to make the text look better
    canvas.width = screen.width * 1.2;
    canvas.height = screen.height * 1.2;

    const ctx = canvas.getContext('2d');
    if (ctx === null) {
        throw new Error('2d context not supported');
    }

    const socket = io("ws://localhost:3000/", {
        reconnectionDelayMax: 10000,
    });
    
    ctx.fillStyle = '#121212';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const size = 25;
    const charsPerRow = Math.floor(canvas.width / (size / 1.67));
    const charsPerCol = Math.floor(canvas.height / size);
    
    ctx.font = `${size}px Courier New`;
    ctx.fillStyle = "#c9c9c9";
    
    for (let y = 0; y < charsPerCol; y++) {
        let line = '.'.repeat(charsPerRow);
        ctx.fillText(line, 0, (y * size) + size);
    }
 

}