
const controls: { [key: string]: Function } = {};

export function register(key: string | string[], callback: Function): void {

    if (Array.isArray(key)) {
        key.forEach(k => {
            controls[k] = callback;
        });
        return;
    }

    controls[key] = callback;
}

/* document.addEventListener('keydown', (event: KeyboardEvent) => {
    const key = event.key;
    if (controls[key]) {
        controls[key]();
    }
}); */