const POSITION_UPDATE_INTERVAL = 50;

export default class MultiplayerClient {
    constructor({ onChatMessage }) {
        this.id = null;
        this.otherPlayers = new Map();
        this.onChatMessage = onChatMessage;
        this.pendingInitialState = null;
        this.positionTimer = null;

        this.socket = new WebSocket(getServerUrl());
        this.socket.addEventListener("open", () => this.sendPendingInitialState());
        this.socket.addEventListener("message", (event) => this.handleMessage(event));
    }

    sendInitialState(name, color) {
        this.pendingInitialState = { type: "initial", name, color };
        this.sendPendingInitialState();
    }

    sendChatMessage(message) {
        return this.send({ type: "chat", message });
    }

    startPositionUpdates(player) {
        if (this.positionTimer !== null) return;

        this.positionTimer = window.setInterval(() => {
            if (this.id === null) return;

            this.send({
                type: "position",
                x: player.x,
                y: player.y,
                grappleX: player.grappleX,
                grappleY: player.grappleY,
                grappling: player.grappling
            });
        }, POSITION_UPDATE_INTERVAL);
    }

    sendPendingInitialState() {
        if (!this.pendingInitialState) return;
        if (this.send(this.pendingInitialState)) this.pendingInitialState = null;
    }

    send(data) {
        if (this.socket.readyState !== WebSocket.OPEN) return false;

        this.socket.send(JSON.stringify(data));
        return true;
    }

    handleMessage(event) {
        let data;

        try {
            data = JSON.parse(event.data);
        } catch {
            return;
        }

        if (data.type === "welcome") {
            this.id = data.id;
            return;
        }

        if (
            data.type === "chat" &&
            typeof data.name === "string" &&
            typeof data.message === "string"
        ) {
            this.onChatMessage(data.name, data.message);
            return;
        }

        if (data.type === "snapshot" && Array.isArray(data.players)) {
            this.updatePlayers(data.players);
        }
    }

    updatePlayers(players) {
        const activePlayerIds = new Set();

        for (const player of players) {
            if (player.id === this.id) continue;

            activePlayerIds.add(player.id);
            this.updatePlayer(player);
        }

        for (const id of this.otherPlayers.keys()) {
            if (!activePlayerIds.has(id)) this.otherPlayers.delete(id);
        }
    }

    updatePlayer(snapshot) {
        const player = this.otherPlayers.get(snapshot.id);

        if (player) {
            player.targetX = snapshot.x;
            player.targetY = snapshot.y;
            player.grappleX = snapshot.grappleX;
            player.grappleY = snapshot.grappleY;
            player.grappling = snapshot.grappling;
            player.name = snapshot.name;
            player.color = snapshot.color;
            return;
        }

        this.otherPlayers.set(snapshot.id, {
            x: snapshot.x,
            y: snapshot.y,
            targetX: snapshot.x,
            targetY: snapshot.y,
            width: 32,
            height: 32,
            grappleX: snapshot.grappleX,
            grappleY: snapshot.grappleY,
            grappling: snapshot.grappling,
            name: snapshot.name,
            color: snapshot.color
        });
    }
}

function getServerUrl() {
    const isLocal = location.hostname === "localhost" ||
        location.hostname === "127.0.0.1";

    return isLocal
        ? "ws://localhost:8080"
        : "wss://vague-hickory-sofa.onrender.com";
}
