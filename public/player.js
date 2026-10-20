export default class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.vx = 0;
        this.vy = 0;
        this.moveSpeed = 0.25;
        this.moveAcceleration = 0.002;
        this.fallTime = 0;
        this.cayoteTime = 250;
        this.jumpPower = 0.5;
        this.touching = [];
        this.canGrapple = true;
        this.grappleX = 0;
        this.grappleY = 0;
        this.grappling = false;
        this.maxGrappleLength = 500;
        this.grappleStep = 4;
        this.grapplePower = 0.0001;
        this.username = "Anonymous";
        this.color = "rgb(80,150,255)";

        this.moveKeys = {
            up: "w",
            down: "s",
            right: "d",
            left: "a",

        };

        this.keysDown = {};
        this.mouse = {
            down: false,
            button: 0,
            x: 0,
            y: 0
        };
    }
}
