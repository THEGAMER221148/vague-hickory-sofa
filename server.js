
const WebSocket = require("ws");
const { randomUUID } = require("node:crypto");

const wss = new WebSocket.Server({ port: 8080 });
wss.on("listening", () => {
    console.log("Server successfully running on port 8080!");
});
const players = new Map();

wss.on("connection", (socket) => {
    const id = randomUUID();

    players.set(id, {
        id,
        x: 0,
        y: 0,
        grappleX: 0,
        grappleY: 0,
        grappling: false
    });

    // Tell this player their unique ID
    socket.send(JSON.stringify({
        type: "welcome",
        id
    }));

    // Receive player positions
    socket.on("message", (raw) => {
        let data;
        try {
            data = JSON.parse(raw.toString());
        } catch {
            return;
        }

        if (data.type !== "position") return;
        if (!Number.isFinite(data.x) ||
            !Number.isFinite(data.y) ||
            !Number.isFinite(data.grappleX) ||
            !Number.isFinite(data.grappleY) ||
            typeof data.grappling !== "boolean") return;

        const player = players.get(id);
        if (!player) return;

        player.x = data.x;
        player.y = data.y;
        player.grappleX = data.grappleX;
        player.grappleY = data.grappleY;
        player.grappling = data.grappling;
    });

    socket.on("close", () => {
        players.delete(id);
    });

    socket.on("error", console.error);
});

// Send everyone the current game state 20 times/sec
setInterval(() => {
    const snapshot = JSON.stringify({
        type: "snapshot",
        players: [...players.values()]
    });

    for (const client of wss.clients) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(snapshot);
        }
    }
}, 50);

console.log("Multiplayer server running on port 8080");
