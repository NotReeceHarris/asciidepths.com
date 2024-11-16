export default class Clock {
    private ctx: CanvasRenderingContext2D;
    private running: boolean = false;
    private memory: any = {};
    private worker: Worker;

    private processes: {
        [name: string]: {
            priority: number;
            function: (ctx: CanvasRenderingContext2D, memory: { [key: string]: any }) => void;
        };
    } = {};

    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;

        // Create the Web Worker
        this.worker = new Worker(new URL('./clockWorker.ts', import.meta.url), { type: 'module' });

        // Listen for messages from the worker (for example, to indicate the clock should be running)
        this.worker.onmessage = (event) => {
            if (event.data === 'tick') {
                this.runProcesses();
            }
        };
    }

    private runProcesses(): void {
        if (!this.running) return;

        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        // Sort the processes by priority
        const processesArray = Object.values(this.processes);
        processesArray.sort((a, b) => a.priority - b.priority);

        // Execute each process (in the main thread)
        for (const process of processesArray) {
            process.function(this.ctx, this.memory);
        }
    }

    public addProcess(name: string, process: (ctx: CanvasRenderingContext2D, memory: { [key: string]: any }) => void, priority: number): void {
        this.processes[name] = {
            priority: priority,
            function: process
        };
    }

    public removeProcess(name: string): void {
        delete this.processes[name];
    }

    public clear(): void {
        this.processes = {};
    }

    public start(): void {
        this.running = true;
        // Start the worker clock by sending a message to the worker
        this.worker.postMessage('start');
    }

    public stop(): void {
        this.running = false;
        // Stop the worker clock by sending a message to the worker
        this.worker.postMessage('stop');
    }
}