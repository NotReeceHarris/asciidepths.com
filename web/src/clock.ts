export default class Clock {

    private processes: {[name: string]: {
        priority: number;
        function: (ctx: CanvasRenderingContext2D, memory: { [key: string]: any }) => void;
    };} = {};
    private ctx: CanvasRenderingContext2D;
    private running: boolean = false;
    private interval: NodeJS.Timeout;
    private memory: any = {};

    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;

        this.interval = setInterval(async () => {

            if (!this.running) return;
            this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

            const processesArray = Object.values(this.processes);
            processesArray.sort((a, b) => a.priority - b.priority);
            for (const process of processesArray) {
                await process.function(this.ctx, this.memory);
            }
        }, 500);
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
    }

    public stop(): void {
        this.running = false;
    }

}