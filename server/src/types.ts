
export type Client = {
    ws: WebSocket,
    authRatelimit: number,
    authenticated: boolean,
    lastContact: number
}