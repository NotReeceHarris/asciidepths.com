const eventListeners: Map<string, EventListener> = new Map();

let socket: WebSocket | null = null;

onmessage = (e: MessageEvent) => {
    const { type, url, event, callback } = e.data;

    switch (type) {
        case 'connect':
            if (!socket) {
                socket = new WebSocket(url);
                // Handle WebSocket events
            socket.addEventListener('message', (event) => {
                // Forward only the serializable data
                postMessage({
                    type: 'message',
                    data: event.data, // Only the message data is sent
                });
            });

            socket.addEventListener('close', () => {
                postMessage({
                    type: 'close',
                });
            });
            }
            break;

        case 'addEventListener':
            if (socket && event) {
                const listener = (ev: Event) => {
                    // Send events back to the main thread
                    postMessage({ type: 'event', event, data: ev });
                };
                socket.addEventListener(event, listener);
                eventListeners.set(event, listener);
            }
            break;

        case 'removeEventListener':
            if (socket && event && eventListeners.has(event)) {
                socket.removeEventListener(event, eventListeners.get(event)!);
                eventListeners.delete(event);
            }
            break;

        case 'send':
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send(callback); // Use `callback` field for message payload
            }
            break;

        case 'close':
            if (socket) {
                socket.close();
                socket = null;
            }
            break;

        default:
            console.warn(`Unknown message type: ${type}`);
    }
};
