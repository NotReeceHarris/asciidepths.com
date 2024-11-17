function isValidJSON(input: string): boolean {
    try {
        JSON.parse(input);
        return true;
    } catch (error) {
        return false;
    }
}

export default class WebSocketClient {
    url: string;
    socket: WebSocket;
    private _heartbeatInterval: NodeJS.Timeout | undefined;
    eventListeners: Map<string, EventListener>;

    constructor(url: string) {
        this.url = url;
        this.socket = new WebSocket(this.url);
        this.eventListeners = new Map();

        // Bind `this` to the event listener methods
        this.eventListenersOpen = this.eventListenersOpen.bind(this);
        this.eventListenersMessage = this.eventListenersMessage.bind(this);
        this.eventListenersClose = this.eventListenersClose.bind(this);

        // Add event listeners
        this.socket.addEventListener('open', this.eventListenersOpen);
        this.socket.addEventListener('message', this.eventListenersMessage);
        this.socket.addEventListener('close', this.eventListenersClose);
    }

    private eventListenersMessage(event: MessageEvent) {

        if (event.data === 'pong') return;

        // Parse and validate the incoming message
        if (!isValidJSON(event.data)) {
            console.error('Invalid JSON:', event.data);
            return;
        }

        console.log(JSON.parse(event.data));
    }

    private eventListenersOpen() {
        console.log('Connection opened.');
        this._heartbeatInterval = setInterval(() => this.socket.send('ping'), 30000);
    }

    private eventListenersClose() {
        this.reconnect();
        if (this._heartbeatInterval) clearInterval(this._heartbeatInterval);
    }

    addEventListener(event: string, callback: EventListener) {
        this.eventListeners.set(event, callback);
        this.socket.addEventListener(event, callback);
    }

    removeEventListener(name: string) {
        const event = this.eventListeners.get(name);
        if (event) this.socket.removeEventListener(name, event);
        this.eventListeners.delete(name)
    }

    reconnect() {
        console.log('Connection closed. Polling reconnection...');
        setTimeout(() => {
            this.socket = new WebSocket(this.url);

            // Reattach event listeners after reconnecting
            this.socket.addEventListener('message', this.eventListenersMessage);
            this.socket.addEventListener('close', this.eventListenersClose);
            this.socket.addEventListener('open', this.eventListenersOpen);

            // Reattach custom event listeners after reconnecting
            this.eventListeners.forEach((callback, event) => {
                this.socket.addEventListener(event, callback);
            });
        }, 1000);
    }
}