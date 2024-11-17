export default class CustomWebSocket {
    url: string;
    socket: WebSocket;
    eventListeners: Map<string, EventListener>;

    constructor(url: string) {
        this.url = url;
        this.socket = new WebSocket(this.url);
        this.eventListeners = new Map();

        // Bind `this` to the event listener methods
        this.eventListenersMessage = this.eventListenersMessage.bind(this);
        this.eventListenersClose = this.eventListenersClose.bind(this);

        this.socket.addEventListener('message', this.eventListenersMessage);
        this.socket.addEventListener('close', this.eventListenersClose);
    }

    private eventListenersMessage(event: MessageEvent) {
        console.log(JSON.parse(event.data));
    }

    private eventListenersClose() {
        console.log('Connection closed. Reconnecting...');
        this.reconnect();
    }

    addEventListener(event: string, callback: EventListener) {
        this.eventListeners.set(event, callback);
        this.socket.addEventListener(event, callback);
    }

    reconnect() {
        setTimeout(() => {
            console.log('Reconnecting...');
            this.socket = new WebSocket(this.url);

            // Reattach event listeners after reconnecting
            this.socket.addEventListener('message', this.eventListenersMessage);
            this.socket.addEventListener('close', this.eventListenersClose);

            // Reattach custom event listeners after reconnecting
            this.eventListeners.forEach((callback, event) => {
                this.socket.addEventListener(event, callback);
            });
        }, 1000);
    }
}
