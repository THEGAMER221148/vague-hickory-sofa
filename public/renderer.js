export default class Renderer {
    constructor({ canvas, player, camera, platforms, images, otherPlayers }) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.player = player;
        this.camera = camera;
        this.platforms = platforms;
        this.images = images;
        this.otherPlayers = otherPlayers;
        this.viewportWidth = window.innerWidth;
        this.viewportHeight = window.innerHeight;
    }

    resize() {
        const pixelRatio = window.devicePixelRatio || 1;

        this.viewportWidth = window.innerWidth;
        this.viewportHeight = window.innerHeight;
        this.canvas.width = Math.round(this.viewportWidth * pixelRatio);
        this.canvas.height = Math.round(this.viewportHeight * pixelRatio);
        this.canvas.style.width = `${this.viewportWidth}px`;
        this.canvas.style.height = `${this.viewportHeight}px`;
        this.ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        this.ctx.imageSmoothingEnabled = false;
    }

    render(playerX = this.player.x, playerY = this.player.y) {
        this.ctx.imageSmoothingEnabled = false;
        this.drawBackground();
        this.drawPlatforms();
        this.drawImages();

        if (this.player.grappling) {
            this.drawGrapple(this.player, playerX, playerY);
        }

        for (const other of this.otherPlayers.values()) {
            this.drawRemotePlayer(other);
        }

        this.drawPlayer(playerX, playerY);
    }

    drawBackground() {
        const green = 200 - Math.abs(this.player.y * 0.0002);
        const blue = 255 - Math.abs(this.player.y * 0.000255);

        this.ctx.fillStyle = `rgb(0, ${green}, ${blue})`;
        this.ctx.fillRect(0, 0, this.viewportWidth, this.viewportHeight);
    }

    drawPlatforms() {
        this.ctx.lineWidth = 1;

        for (const platform of this.platforms) {
            const x = this.toScreenX(platform.x1);
            const y = this.toScreenY(platform.y1);
            const width = platform.width / this.camera.zoom;
            const height = platform.height / this.camera.zoom;

            this.ctx.fillStyle = platform.col;
            this.ctx.strokeStyle = platform.col;
            this.ctx.fillRect(x, y, width, height);
            this.ctx.strokeRect(x, y, width, height);
        }
    }

    drawImages() {
        for (const image of this.images) {
            this.ctx.drawImage(
                image.img,
                this.toScreenX(image.x),
                this.toScreenY(image.y),
                image.width / this.camera.zoom,
                image.height / this.camera.zoom
            );
        }
    }

    drawGrapple(player, x = player.x, y = player.y) {
        this.ctx.strokeStyle = player.color;
        this.ctx.lineWidth = 8 / this.camera.zoom;
        this.ctx.beginPath();
        this.ctx.moveTo(
            this.toScreenX(x + player.width / 2),
            this.toScreenY(y + player.height / 2)
        );
        this.ctx.lineTo(
            this.toScreenX(player.grappleX),
            this.toScreenY(player.grappleY)
        );
        this.ctx.stroke();
    }

    drawRemotePlayer(other) {
        other.x += (other.targetX - other.x) * 0.25;
        other.y += (other.targetY - other.y) * 0.25;

        if (other.grappling) this.drawGrapple(other);

        this.drawPlayerBody(other.x, other.y, 32, 32, other.color);
        this.drawNameTag(other);
    }

    drawPlayer(x, y) {
        this.drawPlayerBody(
            x,
            y,
            this.player.width,
            this.player.height,
            this.player.color
        );
    }

    drawPlayerBody(x, y, width, height, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(
            this.toScreenX(x),
            this.toScreenY(y),
            width / this.camera.zoom,
            height / this.camera.zoom
        );

        this.ctx.fillStyle = "rgb(0, 0, 0)";
        this.ctx.fillRect(
            this.toScreenX(x + 4),
            this.toScreenY(y + 4),
            (width - 8) / this.camera.zoom,
            (height - 8) / this.camera.zoom
        );
    }

    drawNameTag(other) {
        const nameX = this.toScreenX(other.x + 16);
        const nameY = this.toScreenY(other.y - 8);
        const horizontalPadding = 6;
        const verticalPadding = 3;

        this.ctx.font = "24px monospace";
        this.ctx.textAlign = "center";

        const metrics = this.ctx.measureText(other.name);
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        this.ctx.fillRect(
            nameX - metrics.width / 2 - horizontalPadding,
            nameY - metrics.actualBoundingBoxAscent - verticalPadding,
            metrics.width + horizontalPadding * 2,
            metrics.actualBoundingBoxAscent +
                metrics.actualBoundingBoxDescent +
                verticalPadding * 2
        );

        this.ctx.fillStyle = "rgb(255, 255, 255)";
        this.ctx.fillText(other.name, nameX, nameY);
    }

    toScreenX(worldX) {
        return (worldX - this.camera.x) / this.camera.zoom;
    }

    toScreenY(worldY) {
        return (worldY - this.camera.y) / this.camera.zoom;
    }
}
