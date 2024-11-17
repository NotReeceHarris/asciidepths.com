export default class CustomWebSocket {
    private worker: Worker;
    private url: string;
    private eventListeners: Map<string, EventListener>;

    constructor(url: string) {
        this.url = url;
        this.worker = new Worker(new URL('../workers/websocket.worker.ts', import.meta.url));
        this.eventListeners = new Map();

        // Connect the WebSocket in the worker
        this.worker.postMessage({ type: 'connect', url });

        // Handle messages from the worker
        this.worker.onmessage = (e: MessageEvent) => {
            const { type, event, data } = e.data;

            if (type === 'message') {
                console.log(JSON.parse(data)); // Process incoming messages
            } else if (type === 'close') {
                console.log('Connection closed. Reconnecting...');
                this.reconnect();
            } else if (type === 'event' && event && this.eventListeners.has(event)) {
                const listener = this.eventListeners.get(event)!;
                listener(data); // Call the listener with the event data
            }
        };
    }

    addEventListener(event: string, callback: EventListener) {
        this.eventListeners.set(event, callback);
        this.worker.postMessage({ type: 'addEventListener', event });
    }

    removeEventListener(event: string) {
        if (this.eventListeners.has(event)) {
            this.worker.postMessage({ type: 'removeEventListener', event });
            this.eventListeners.delete(event);
        }
    }

    send(message: string) {
        this.worker.postMessage({ type: 'send', callback: message });
    }

    reconnect() {
        setTimeout(() => {
            console.log('Reconnecting...');
            this.worker.postMessage({ type: 'connect', url: this.url });

            // Reattach custom event listeners
            this.eventListeners.forEach((_, event) => {
                this.worker.postMessage({ type: 'addEventListener', event });
            });
        }, 1000);
    }

    close() {
        this.worker.postMessage({ type: 'close' });
    }
}
