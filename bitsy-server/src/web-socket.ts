import WebSocket from "ws";

var webSocketServer: WebSocket.Server;

export function createWsServer() {
    webSocketServer = new WebSocket.Server({port: 8089}); //, path: "/jobs" }
    webSocketServer.on("listening", () => {
        console.error("Jobs socket server started on port 8089", webSocketServer.address());
    });

    webSocketServer.on("error", error => {
        console.error("Error starting jobs socket server", error);
    });

    webSocketServer.on("connection", (socket, request) => {
        console.info("New client connected to jobs socket");
    });
}

export function broadcast(data: any) {
    webSocketServer.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}
