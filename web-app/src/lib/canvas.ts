export function clearScreen(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#121212';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}