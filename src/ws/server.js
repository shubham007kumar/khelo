import { WebSocket, WebSocketServer } from "ws";

function sendJson(socket, payload) {
    if (socket.readyState !== WebSocket.OPEN) return;

    const msg = JSON.stringify(payload)

    socket.send(msg)
}

function broadCast(wss, payload) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) sendJson(client, payload)
    })
}

export function initWsServer(expressApp) {
    const wss = new WebSocketServer({ server: expressApp, path: '/ws' })

    wss.on('connection', (socket, req) => {
        const ip = req.socket.remoteAddress || 'unknown'
        sendJson(socket, { type: "Welcome" })
        console.log(`New ws connection from ${ip}`)

        socket.on('error', console.error)
    })

    function broadcastMatchUpdate(match) {
        broadCast(wss, { type: "match_created", data: match })
    }

    return { broadcastMatchUpdate }
}