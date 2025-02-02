const font_size = 16;
const font = `${font_size}px "Courier New", Courier, monospace`
const x_offset = Math.floor(font_size / 1.6)
const y_offset = font_size + 5

function drawTile(ctx: CanvasRenderingContext2D, tile: string, X: number, Y: number): void {
    for (let y = 0; y < tile.split('\n').length; y++) {
        const line = tile.split('\n')[y].split('');

        for (let x = 0; x < line.length; x++) {
            const char = line[x];

            ctx.fillText(char, (X+x) * x_offset, (1+Y+y) * y_offset);
        }
    }
}

function decode(string: string): string {
    const binaryString = atob(string); // Decode Base64 to binary string
    const decodedString = new TextDecoder('utf-8').decode(new Uint8Array([...binaryString].map(char => char.charCodeAt(0))));
    return decodedString;
}
export function move(x: number, y: number, floor: string): {
    x: number,
    y: number
} | null {

    const tile = decode(floor);
    const relative_x = Math.floor(x / x_offset);
    const relative_y = Math.floor(y / y_offset);

    const lines = tile.split('\n');
    const floory = lines[relative_y];

    if (!floory) {
        return null;
    }

    const target = floory.split('')[relative_x];

    if (target !== '#') {
        return null;
    }

    return {
        x: relative_x,
        y: relative_y
    }
}

export function draw(canvas: HTMLCanvasElement, map: {background: string, highlight: string, floor: string, foreground: string}, players: {[username: string]: {x: number,y: number}}, posx: number, posy: number): void {

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Failed to get canvas context');
        return;
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.font = font;

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#333333'; //'rgba(255, 255, 255, 0.2)';
    drawTile(ctx, decode(map.background), 0, 0);

    ctx.fillStyle = '#636363'; //'rgba(255, 255, 255, 0.3)';
    drawTile(ctx, decode(map.highlight), 0, 0);

    ctx.fillStyle = '#f7f7f7'; // 'rgba(255, 255, 255, 0.8)';
    drawTile(ctx, decode(map.foreground), 0, 0);

    ctx.fillStyle = 'rgba(255, 0, 0, 0.05)';
    drawTile(ctx, decode(map.floor), 0, 0);


    const other_player_char = '#';
    
    ctx.fillStyle = 'white';
    ctx.fillText(' 0', (posx-1) * x_offset, (posy-1) * y_offset);
    ctx.fillText('/|\\', (posx-1) * x_offset, (posy) * y_offset);
    ctx.fillText('/ \\', (posx-1) * x_offset, (posy+1) * y_offset);

    ctx.fillStyle = 'green';
    
    for (const [username, player] of Object.entries(players)) {

        console.log(username);
        const x = player.x * x_offset;
        const y = (player.y+1) * y_offset;

        if (x == posx * x_offset && y == posy * y_offset) continue;
        if (x > canvas.width || y > canvas.height) continue;

        ctx.fillText(other_player_char, x, y);
    }


}