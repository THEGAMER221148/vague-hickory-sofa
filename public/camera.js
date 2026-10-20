export default class Camera {
    constructor(subject) {
        this.x = 0;
        this.y = 0;
        this.subject = subject;
        this.smoothing = 4;
        this.zoom = 1;
    }

    glideTo(x, y, deltaTime) {
        const referenceFrameTime = 1000 / 60;
        const blend = 1 - Math.pow(1 - 1 / this.smoothing, deltaTime / referenceFrameTime);
        this.x += (x - this.x) * blend;
        this.y += (y - this.y) * blend;
    }

    moveTo(x, y) {
        this.x = x;
        this.y = y;
    }

    screenToWorld(x, y) {
        return {
            x: x * this.zoom + this.x,
            y: y * this.zoom + this.y
        };
    }
}
