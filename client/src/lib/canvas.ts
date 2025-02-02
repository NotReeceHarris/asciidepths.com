const font_size = 20;
const font = `${font_size}px "Courier New", Courier, monospace`
const x_offset = Math.floor(font_size / 1.6)
const y_offset = font_size + 5

function drawTile(ctx: CanvasRenderingContext2D, tile: string, X: number, Y: number): void {
    console.log(tile);

    for (let y = 0; y < tile.split('\n').length; y++) {
        const line = tile.split('\n')[y].split('');

        for (let x = 0; x < line.length; x++) {
            const char = line[x];
            console.log(char);

            ctx.fillText(char, (X+x) * x_offset, (1+Y+y) * y_offset);
        }
    }
}

export function draw(canvas: HTMLCanvasElement, map: {background: string, highlight: string, floor: string}, players: {[username: string]: {x: number,y: number}}, posx: number, posy: number): void {

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Failed to get canvas context');
        return;
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = font;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    drawTile(ctx, map.background, 0, 0);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    drawTile(ctx, map.highlight, 0, 0);

    /* ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
    drawTile(ctx, map.floor, 0, 0); */

    const player_char = '_';
    const other_player_char = '_';
    
    ctx.font = font;
    ctx.fillStyle = 'white';
    ctx.fillText(player_char, posx * x_offset, posy * y_offset);

    ctx.font = font;
    ctx.fillStyle = 'green';
    
    for (const [username, player] of Object.entries(players)) {

        console.log(username);
        const x = player.x * x_offset;
        const y = player.y * y_offset;

        if (x == posx * x_offset && y == posy * y_offset) {
            continue;
        }

        if (x > canvas.width || y > canvas.height) {
            continue;
        }

        ctx.fillText(other_player_char, x, y);
    }


}