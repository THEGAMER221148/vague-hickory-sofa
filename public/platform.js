export default class Platform {
    constructor(x1, y1, x2, y2, col, friction = 0.01, bounciness = 0) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.width = Math.abs(this.x1 - this.x2);
        this.height = Math.abs(this.y1 - this.y2);
        this.col = col;
        this.friction = friction;
        this.bounciness = bounciness;
    }
}