export default class Clock {
    private ctx: CanvasRenderingContext2D;
    private running: boolean;
    private memory: any;
    private worker: Worker;

    private processes: {
        [name: string]: {
            priority: number;
            function: (ctx: CanvasRenderingContext2D, memory: { [key: string]: any }) => void;
        };
    } = {};

    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
        this.memory = {};
        this.running = false;

        // Create the Web Worker
        this.worker = new Worker(new URL('../workers/clock.worker.ts', import.meta.url), { type: 'module' });

        // Listen for messages from the worker (for example, to indicate the clock should be running)
        this.worker.onmessage = (event) => {
            if (event.data === 'tick') {
                this.runProcesses();
            }
        };
    }

    destroy(): void {
        // Stop the worker clock
        this.stop();

        // Terminate the worker
        this.worker.terminate();

        // Clear the processes object
        this.processes = {};

        // Clear the memory object
        this.memory = {};
    }

    private async runProcesses(): Promise<void> {
        if (!this.running) return;

        const newCanvas = document.createElement('canvas') as HTMLCanvasElement;
        newCanvas.width = this.ctx.canvas.width;
        newCanvas.height = this.ctx.canvas.height;
        const newCtx = newCanvas.getContext('2d') as CanvasRenderingContext2D;

        // Sort the processes by priority
        const processesArray = Object.values(this.processes);
        processesArray.sort((a, b) => a.priority - b.priority);

        // Execute each process (in the main thread)
        for (const process of processesArray) {
            await process.function(newCtx, this.memory);
        }

        // Clear the canvas
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        // Draw the new canvas to the main canvas
        this.ctx.drawImage(newCanvas, 0, 0);
    }

    public addProcess(name: string, process: (ctx: CanvasRenderingContext2D, memory: { [key: string]: any }) => void, priority: number): void {
        // Add the process to the processes object
        this.processes[name] = {
            priority: priority,
            function: process
        };
    }

    public removeProcess(name: string): void {
        // Remove the process from the processes object
        delete this.processes[name];
    }

    public clear(): void {
        // Clear the processes object
        this.processes = {};
    }

    public start(): void {
        // Start the worker clock by sending a message to the worker
        this.running = true;
        this.worker.postMessage('start');
    }

    public stop(): void {
        // Stop the worker clock by sending a message to the worker
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.running = false;
        this.worker.postMessage('stop');
    }
}