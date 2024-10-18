export function start(charsPerRow: number, charsPerCol: number): string[][] {
    return Array.from({ length: charsPerCol }, () =>Array(charsPerRow).fill("`"))
} 