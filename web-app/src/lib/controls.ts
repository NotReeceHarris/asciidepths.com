
const controls: { [key: string]: Function } = {};

export function register(key: string, callback: Function): void {
    controls[key] = callback;
}

document.addEventListener('keydown', (event: KeyboardEvent) => {
    const key = event.key;
    if (controls[key]) {
        controls[key]();
    }
});