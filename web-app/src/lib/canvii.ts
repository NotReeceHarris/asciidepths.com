/**
 * The previous frame rendered on the canvas.
 * Used to compare with the current frame to determine if an update is necessary.
 * 
 * @type {string[][]}
 */
let prevFrame: string[][];

/**
 * Clears the entire canvas and fills it with a specified background color.
 * 
 * @param {CanvasRenderingContext2D} ctx - The 2D rendering context for the canvas.
 */
export function clearScreen(ctx: CanvasRenderingContext2D): void {
    // Clear the entire canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Set the fill color to a dark gray
    ctx.fillStyle = '#121212';
    
    // Fill the entire canvas with the fill color
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

/**
 * Places a text element onto a frame at specified coordinates.
 * 
 * @param {string[][]} frame - The current frame represented as a 2D array of strings.
 * @param {string | string[]} text - The text element to be placed, can be a single string or an array of strings.
 * @param {number} X - The X coordinate where the top-left corner of the text element will be placed.
 * @param {number} Y - The Y coordinate where the top-left corner of the text element will be placed.
 * @param {boolean} [center=false] - If true, the text element will be centered at the (X, Y) coordinates.
 * @returns {string[][]} - The new frame with the text element placed on it.
 */
export function place(frame: string[][], text: string | string[], X: number, Y: number, center: boolean = false): string[][] {
    
    if (!frame) {
        return [[]];
    }
    
    // Ensure text is a string
    if (Array.isArray(text)) text = text[0];

    // Split the text into lines based on newline characters
    const lines = text.split('\n');

    // Create a deep copy of the frame
    const newFrame = frame.map(row => [...row]);

    // Adjust the X and Y coordinates if the text should be centered
    if (center) {
        X -= Math.floor(lines[0].length / 2);
        Y -= Math.floor(lines.length / 2) + 1;
    }

    // Iterate over each line of the text
    for (let y = 0; y < lines.length; y++) {
        const line = lines[y];

        // Iterate over each character in the line
        for (let x = 0; x < line.length; x++) {
            const char = line[x];

            // Skip the character if it is '╶'
            if (char === '╶') {
                continue;
            }

            // Calculate the new coordinates for the character
            const newY = Y + y;
            const newX = X + x;

            // Check if the new coordinates are within the bounds of the frame
            if (newY >= 0 && newY < frame.length && newX >= 0 && newX < frame[0].length) {
                // Place the character in the new frame
                newFrame[newY][newX] = char;
            }
        }
    }

    // Return the new frame with the text placed on it
    return newFrame;
}

/**
 * Updates the canvas with the provided frame.
 * 
 * @param {CanvasRenderingContext2D} ctx - The 2D rendering context for the canvas.
 * @param {string[][]} frame - The frame to be rendered on the canvas.
 */
export function update(ctx: CanvasRenderingContext2D, frame: string[][]): void {
    // Check if the frame is not defined
    if (!frame) {
        console.log('Frame not found');
        return;
    }

    // Check if the current frame is the same as the previous frame
    if (prevFrame === frame) {
        return;
    }

    // Save the frame so we can compare it next time, have to do this because arrays are passed by reference
    prevFrame = frame.map(row => [...row]);

    // Clear the canvas before drawing the new frame
    clearScreen(ctx);

    // Set the font size and style for the text
    const size = 25;
    ctx.font = `${size}px Courier New`;
    ctx.fillStyle = "#c9c9c9";

    // Iterate over each row in the frame
    for (let y = 0; y < frame.length; y++) {
        // If the row is not defined, break the loop
        if (!frame[y]) {
            break;
        }
        // Draw the text on the canvas at the specified position
        ctx.fillText(frame[y].join(''), size / 3, ((y * size) + (size / 1.2)));
    }
}