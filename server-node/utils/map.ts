import fs from 'fs';

const mapCache = new Map();
export function getMap(id: string, name: string): {
    background: string,
    highlight: string,
    floor: string,
    foreground: string,
} {
    if (mapCache.has(id)) {
        return mapCache.get(id)
    }

    const background = fs.readFileSync(`./maps/${name}/background.txt`, 'utf8');
    const highlight = fs.readFileSync(`./maps/${name}/highlight.txt`, 'utf8');
    const floor = fs.readFileSync(`./maps/${name}/floor.txt`, 'utf8');
    const foreground = fs.readFileSync(`./maps/${name}/foreground.txt`, 'utf8');

    const payload = { 
        background: Buffer.from(background, 'utf8').toString('base64'), 
        highlight: Buffer.from(highlight, 'utf8').toString('base64'), 
        floor: Buffer.from(floor, 'utf8').toString('base64'), 
        foreground: Buffer.from(foreground, 'utf8').toString('base64'),
    };

    mapCache.set(id, payload);
    return payload;
}