import { io, Socket } from "socket.io-client";
import * as menus from "$lib/frames";
import * as canvi from "$lib/canvi";

/**
 * Class representing the global application state and functionality.
 */
export class AppGlobals {

    /** @type {Socket | undefined} The WebSocket connection. */
    socket: Socket | undefined;

    /** @type {HTMLCanvasElement} The canvas element. */
    canvas: HTMLCanvasElement;

    /** @type {CanvasRenderingContext2D} The 2D rendering context for the canvas. */
    ctx: CanvasRenderingContext2D;

    /** @type {string[][]} The current frame to be rendered on the canvas. */
    frame: string[][];

    /** @type {ReturnType<typeof setInterval> | undefined} The interval timer for updating the canvas. */
    clock: ReturnType<typeof setInterval> | undefined;

    /**
     * Create an instance of AppGlobals.
     * @param {HTMLCanvasElement} canvas - The canvas element to be used.
     * @throws Will throw an error if the 2D context is not supported.
     */
    constructor(canvas: HTMLCanvasElement) {
        this.frame = menus.landing;

        this.canvas = canvas;
        this.canvas.width = 2550;
        this.canvas.height = 1275;

        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("2d context not supported");
        this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    }

    /**
     * Start the interval timer to update the canvas at a fixed rate.
     */
    startClock() {
        this.clock = setInterval(() => {
            canvi.update(this.ctx, this.frame);
        }, 1000 / 7);
    }

    /**
     * Stop the interval timer for updating the canvas.
     */
    stopClock() {
        if (this.clock) {
            clearInterval(this.clock);
        }
    }

    /**
     * Establish a WebSocket connection.
     */
    connect() {
        this.socket = io("ws://localhost:3000/", {
            reconnectionDelayMax: 10000,
        });
    }

    /**
     * Disconnect the WebSocket connection.
     */
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }

    /**
     * Update the current frame to be rendered on the canvas.
     * @param {string[][]} frame - The new frame to be rendered.
     */
    updateFrame(frame: string[][]) {
        this.frame = frame;
    }
}