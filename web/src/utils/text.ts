export function writeText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number | null,
    center: boolean,
    font: string
) {
    const words = text.split(' ');
    let line = '';
    const lineHeight = 20; // You can adjust this as needed

    if (maxWidth === null) {
        maxWidth = ctx.canvas.width;
    }

    // If center is true, calculate the total text height and adjust `y` for vertical centering
    if (center) {
        // Split text into lines and calculate total height
        const lines = [];
        let tempLine = '';
        let totalHeight = 0;

        for (let n = 0; n < words.length; n++) {
            const testLine = tempLine + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                lines.push(tempLine);
                tempLine = words[n] + ' ';
                totalHeight += lineHeight;
            } else {
                tempLine = testLine;
            }
        }
        lines.push(tempLine); // Push the last line
        totalHeight += lineHeight; // Account for the last line height

        // Adjust the `y` position for vertical centering
        y -= totalHeight / 2;

        // Now render the text with the calculated `y`
    }

    // Draw the last line
    ctx.font = font;

    // Loop through words and draw text
    let currentY = y;  // We will adjust `y` as we go through the lines
    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;

        if (testWidth > maxWidth && n > 0) {
            // When the line exceeds maxWidth, draw the previous line
            if (center) {
                const lineWidth = ctx.measureText(line).width;
                ctx.fillText(line, x - lineWidth / 2, currentY); // Center horizontally
            } else {
                ctx.fillText(line, x, currentY); // Default position
            }
            line = words[n] + ' ';
            currentY += lineHeight;
        } else {
            line = testLine;
        }
    }

    // Draw the final line
    if (center) {
        const lineWidth = ctx.measureText(line).width;
        ctx.fillText(line, x - lineWidth / 2, currentY); // Center horizontally
    } else {
        ctx.fillText(line, x, currentY); // Default position
    }
}