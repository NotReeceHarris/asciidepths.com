import { io, Socket } from "socket.io-client";
import * as menus from "$lib/frames";
import * as canvii from "$lib/canvii";

/**
 * Class representing the global application state and functionality.
 */
export class AppGlobals {

    /** @type {Socket | undefined} The WebSocket connection. */
    private _socket: Socket | undefined;

    /** @type {HTMLCanvasElement} The canvas element. */
    readonly canvas: HTMLCanvasElement;

    /** @type {CanvasRenderingContext2D} The 2D rendering context for the canvas. */
    private _ctx: CanvasRenderingContext2D;

    /** @type {string[][]} The current frame to be rendered on the canvas. */
    private _frame: string[][];

    /** @type {ReturnType<typeof setInterval> | undefined} The interval timer for updating the canvas. */
    private _clock: ReturnType<typeof setInterval> | undefined;

    /** @type {number} The frames per second for updating the canvas. */
    readonly fps: number;

    /** @type {number} The x-coordinate of the current player pos. */
    private _x: number;

    /** @type {number} The y-coordinate of the current player pos. */
    private _y: number;

    /**
     * Create an instance of AppGlobals.
     * @param {HTMLCanvasElement} canvas - The canvas element to be used.
     * @throws Will throw an error if the 2D context is not supported.
     */
    constructor(canvas: HTMLCanvasElement) {
        this._frame = menus.blank;

        this.canvas = canvas;
        this.canvas.width = 2550;
        this.canvas.height = 1275;
        this.fps = 7;

        this._x = 1;
        this._y = 1;

        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("2d context not supported");
        this._ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    }

    /**
     * Start the interval timer to update the canvas at a fixed rate.
     */
    startClock() {
        this._clock = setInterval(() => {
            canvii.update(this._ctx, this._frame);
        }, 1000 / this.fps);
    }

    /**
     * Stop the interval timer for updating the canvas.
     */
    stopClock() {
        if (this._clock) {
            clearInterval(this._clock);
        }
    }

    /**
     * Establish a WebSocket connection.
     */
    connect() {
        this._socket = io("wss://dev-wss.asciidepths.com", {
            reconnectionDelayMax: 10000,
        });
    }

    /**
     * Disconnect the WebSocket connection.
     */
    disconnect() {
        if (this._socket) {
            this._socket.disconnect();
        }
    }

    /**
     * Update the current frame to be rendered on the canvas.
     * @param {string[][]} frame - The new frame to be rendered.
     */
    updateFrame(frame: string[][]) {
        this._frame = frame;
    }

    /**
     * Get the x-coordinate of the current player position.
     * @param {number} The x-coordinate of the current player position.
     */
    set x(x: number) {

        if (x < 0 || x > 166) {
            return;
        }

        this._x = x;
    }

    /**
     * Set the y-coordinate of the current player position.
     * @param {number} The y-coordinate of the current player position.
     */
    set y(y: number) {

        console.log(y);

        if (y < 0 || y > 48) {
            return;
        }

        this._y = y;
    }

    /**
     * Get the x-coordinate of the current player position.
     * @returns {number} The x-coordinate of the current player position.
     */
    get x() {
        return this._x;
    }

    /**
     * Get the y-coordinate of the current player position.
     * @returns {number} The y-coordinate of the current player position.
     */
    get y() {
        return this._y;
    }
}