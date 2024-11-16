let running = false;
let interval: NodeJS.Timeout;

self.onmessage = (event) => {
    if (event.data === 'start') {
        if (!running) {
            running = true;
            startClock();
        }
    } else if (event.data === 'stop') {
        running = false;
        clearInterval(interval);
    }
};

function startClock() {
    // Send tick immediately so we don't have to wait for the first interval
    postMessage('tick');

    // Generate the clock interval
    interval = setInterval(() => {
        if (running) postMessage('tick');
    }, 500);
}