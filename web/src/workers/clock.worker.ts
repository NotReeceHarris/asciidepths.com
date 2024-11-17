(()=>{
    let running = false;
    let interval: NodeJS.Timeout;

    function startClock() {
        console.log('Game clock started.');
        postMessage('tick');

        // Generate the clock interval
        interval = setInterval(() => {
            if (running) {
                postMessage('tick');
            };
        }, 500);
    }

    self.onmessage = (event) => {
        if (event.data === 'start' && !running) {
            running = true;
            startClock();
        } else if (event.data === 'stop') {
            console.log('Clock stopped');
            running = false;
            clearInterval(interval);
        }
    };
})()