import Player from "./player.js";
import Platform from "./platform.js";
import Camera from "./camera.js";
import ImageLabel from "./ImageLabel.js";
// World settings
let gravity = 0.001;
const REFERENCE_FRAME_TIME = 1000 / 60;
const PHYSICS_STEP = 1000 / 120;
const MAX_FRAME_TIME = 50;
const world = [
    new Platform(-500, 100, 500, 300, "rgb(0, 255, 0)"),
    new Platform(600, 100, 700, 200, "rgb(0, 255, 0)"),
    new Platform(800, 0, 900, 100, "rgb(0, 255, 0)"),
    new Platform(1100, -50, 1200, 50, "rgb(0, 255, 0)"),
    new Platform(1000, -170, 1100, -150, "rgb(0, 255, 0)"),
    new Platform(700, -220, 800, -200, "rgb(0, 255, 0)"),

    new Platform(500, -300, 600, -280, "rgb(0, 177, 38)"),
    new Platform(0, -1000, 400, -280, "rgb(0, 177, 38)"),
    new Platform(400, -400, 500, -280, "rgb(0, 177, 38)"),
    new Platform(400, -500, 500, -480, "rgb(0, 177, 38)"),
    new Platform(400, -600, 500, -580, "rgb(0, 177, 38)"),
    new Platform(400, -700, 510, -680, "rgb(0, 177, 38)"),
    new Platform(400, -800, 520, -780, "rgb(0, 177, 38)"),
    new Platform(400, -900, 530, -880, "rgb(0, 177, 38)"),
    new Platform(400, -1000, 540, -980, "rgb(0, 177, 38)"),
    new Platform(0, -1100, 200, -980, "rgb(0, 177, 38)"),

    new Platform(-2000, 100, -500, 300, "rgb(128, 128, 128)"),
    new Platform(-1000, -1000000, -950, 0, "rgb(128, 128, 128)"),
    new Platform(-950, -1000000, 0, -999950, "rgb(128, 128, 128)"),
    new Platform(-1200, -100000, -1150, 0, "rgb(128, 128, 128)"),
    new Platform(-1400, -10000, -1350, 0, "rgb(128, 128, 128)"),
    new Platform(-1600, -1000, -1550, 0, "rgb(128, 128, 128)"),
    new Platform(-1800, -100, -1750, 0, "rgb(128, 128, 128)"),
    new Platform(-2000, -10, -1950, 0, "rgb(128, 128, 128)"),

    new Platform(-4000, 100, -2000, 300, "rgb(255, 255, 0)", 0.01, 0.9),
    new Platform(-4000, -1000, -3000, -900, "rgb(255, 255, 0)", 0.01, 0.9),
    new Platform(-3000, -5000, -2950, -900, "rgb(255, 255, 0)", 0.01, 0.9),
    new Platform(-2750, -5000, -2700, -900, "rgb(255, 255, 0)", 0.01, 0.9),
    new Platform(-3500, -2000, -3250, -1750, "rgb(255, 255, 0)", 0.01, 0.9),
    new Platform(-4000, -3000, -3750, -2750, "rgb(255, 255, 0)", 0.01, 0.9),
    new Platform(-3500, -4000, -3250, -3750, "rgb(255, 255, 0)", 0.01, 0.9),
    new Platform(-4000, -5000, -3750, -4750, "rgb(255, 255, 0)", 0.01, 0.9),

];

const images = [
    new ImageLabel("./images/Vague Hickory Sofa.png", -800, -1000200, 200, 200)
];

// Player Stuff
const plr = new Player(0, 0);
const cam = new Camera(plr);
let previousPlayerX = plr.x;
let previousPlayerY = plr.y;

// Key presses
window.addEventListener("keydown", (ev) => {
    plr.keysDown[ev.key.toLowerCase()] = true;
    if (ev.key.toLowerCase() === "r") {
        plr.x = 0;
        plr.y = 0;
        previousPlayerX = plr.x;
        previousPlayerY = plr.y;
        plr.vx = 0;
        plr.vy = 0;
        plr.width = 32;
        plr.height = 32;
        plr.moveSpeed = 0.25;
        plr.moveAcceleration = 0.002;
        plr.fallTime = 0;
        plr.cayoteTime = 250;
        plr.jumpPower = 0.5;
        plr.touching = [];
    }
    if (ev.key.toLowerCase() === " " && !plr.grappling && plr.canGrapple) {
        grapple();
    }
});
window.addEventListener("keyup", (ev) => {
    plr.keysDown[ev.key.toLowerCase()] = false;
    if (ev.key.toLowerCase() === " ") {
        plr.grappling = false;
    }
});
window.addEventListener("mousedown", (ev) => {
    plr.mouse.down = true;
    plr.mouse.button = ev.button;
    plr.mouse.x = ev.clientX;
    plr.mouse.y = ev.clientY;
    // grapple thing
    if (plr.canGrapple && !plr.grappling) {
        grapple();
    }
});
window.addEventListener("mouseup", (ev) => {
    plr.mouse.down = false;
    plr.grappling = false;
});
window.addEventListener("mousemove", (ev) => {
    plr.mouse.x = ev.clientX;
    plr.mouse.y = ev.clientY;
});
// Scroll detection
window.addEventListener("wheel", (ev) => {
    cam.zoom += ev.deltaY / 100;
    if (cam.zoom < 0.1) cam.zoom -= ev.deltaY / 100;
    cam.moveTo(plr.x + plr.width / 2 - (viewportWidth / 2 * cam.zoom), plr.y + plr.height / 2 - (viewportHeight / 2 * cam.zoom));
});

function grapple() {
    plr.grappleX = plr.x + plr.width / 2;
    plr.grappleY = plr.y + plr.height / 2;

    const mouseWorld = cam.screenToWorld(plr.mouse.x, plr.mouse.y);
    const angle = Math.atan2(mouseWorld.y - plr.grappleY, mouseWorld.x - plr.grappleX);
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    
    let steps = 0;
    let collided = false;
    while (!collided && steps < plr.maxGrappleLength) {
        plr.grappleX += dx * plr.grappleStep;
        plr.grappleY += dy * plr.grappleStep;
        for (const plat of world) {
            if (plr.grappleX < plat.x2 && plr.grappleX > plat.x1 && plr.grappleY > plat.y1 && plr.grappleY < plat.y2) {
                collided = true;
                plr.grappling = true;
                break;
            }
        }
        steps ++;
    }
}

// physics stuff (still basically just player stuff)
function stepPhysics(deltaTime) {
    const frameScale = deltaTime / REFERENCE_FRAME_TIME;
    plr.touching = [];
    plr.vy += gravity * deltaTime;
    plr.fallTime += deltaTime;

    // Grapple Physics
    if (plr.grappling) {
        plr.vx += plr.grapplePower * (plr.grappleX - plr.x - plr.width / 2) * (deltaTime / 10);
        plr.vy += plr.grapplePower * (plr.grappleY - plr.y - plr.height / 2) * (deltaTime / 10);
    }

    // air resistance
    const airResistance = Math.pow(0.999, frameScale);
    plr.vx *= airResistance;
    plr.vy *= airResistance;

    // x-check
    plr.x += plr.vx * deltaTime;
    for (const plat of world) {
        if (plr.x < plat.x2 && plr.x + plr.width > plat.x1 && plr.y + plr.height > plat.y1 && plr.y < plat.y2) {
            plr.x -= plr.vx * deltaTime;
            plr.vx = -plr.vx * plat.bounciness;
            plr.touching.push(plat);
        }
    }

    // y-check
    plr.y += plr.vy * deltaTime;
    for (const plat of world) {
        if (plr.y < plat.y2 && plr.y + plr.height > plat.y1 && plr.x + plr.width > plat.x1 && plr.x < plat.x2) {
            plr.y -= plr.vy * deltaTime;
            if (plr.vy > 0) {
                plr.fallTime = 0;
            }
            plr.vy = -plr.vy * plat.bounciness;
            plr.touching.push(plat);
        }
    }

    if (!plr.grappling) {
        let targetVelocity = null;
        if (plr.keysDown[plr.moveKeys.right]) {
            targetVelocity = plr.moveSpeed;
        } else if (plr.keysDown[plr.moveKeys.left]) {
            targetVelocity = -plr.moveSpeed;
        }
        if (targetVelocity !== null) {
            const velocityDifference = targetVelocity - plr.vx;
            const velocityChange = plr.moveAcceleration * deltaTime;
            plr.vx += Math.sign(velocityDifference) * Math.min(Math.abs(velocityDifference), velocityChange);
        }
        if (plr.fallTime < plr.cayoteTime && plr.touching.length !== 0) {
            const friction = plr.touching[0].friction * frameScale;
            if (Math.abs(plr.vx) <= friction) {
                plr.vx = 0;
            } else {
                plr.vx -= Math.sign(plr.vx) * friction;
            }
        }

        // jump check
        if (plr.keysDown[plr.moveKeys.up] && plr.fallTime < plr.cayoteTime) {
            plr.vy -= plr.jumpPower;
            plr.fallTime = plr.cayoteTime;
        }
    }
}

// render stuff
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let viewportWidth = window.innerWidth;
let viewportHeight = window.innerHeight;

function resizeCanvas() {
    const pixelRatio = window.devicePixelRatio || 1;
    viewportWidth = window.innerWidth;
    viewportHeight = window.innerHeight;
    canvas.width = Math.round(viewportWidth * pixelRatio);
    canvas.height = Math.round(viewportHeight * pixelRatio);
    canvas.style.width = `${viewportWidth}px`;
    canvas.style.height = `${viewportHeight}px`;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingEnabled = false;
}

function render(playerX, playerY) {
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = `rgb(0, ${200 - Math.abs(plr.y * 0.0002)}, ${255 - Math.abs(plr.y * 0.000255)})`;
    ctx.fillRect(0, 0, viewportWidth, viewportHeight);

    // Render blocks
    ctx.lineWidth = 1;
    for (const plat of world) {
        ctx.fillStyle = plat.col;
        ctx.strokeStyle = plat.col;
        ctx.fillRect((plat.x1 - cam.x) / cam.zoom, (plat.y1 - cam.y) / cam.zoom, plat.width / cam.zoom, plat.height / cam.zoom);
        ctx.strokeRect((plat.x1 - cam.x) / cam.zoom, (plat.y1 - cam.y) / cam.zoom, plat.width / cam.zoom, plat.height / cam.zoom)
    }

    for (const plat of images) {
        ctx.drawImage(
            plat.img,
            (plat.x - cam.x) / cam.zoom,
            (plat.y - cam.y) / cam.zoom,
            plat.width / cam.zoom,
            plat.height / cam.zoom
        );
    }

    // Draw grapple hook
    if (plr.grappling) {
        ctx.strokeStyle = "rgb(50, 50, 50)";
        ctx.lineWidth = 8 / cam.zoom;
        ctx.beginPath();
        ctx.moveTo((playerX + plr.width / 2 - cam.x) / cam.zoom, (playerY + plr.height / 2 - cam.y) / cam.zoom);
        ctx.lineTo((plr.grappleX - cam.x) / cam.zoom, (plr.grappleY - cam.y) / cam.zoom);
        ctx.stroke();
    }

    // Draw other players
    for (const other of otherPlayers.values()) {
        // Smooth movement between network updates
        other.x += (other.targetX - other.x) * 0.25;
        other.y += (other.targetY - other.y) * 0.25;

        // Draw their grapple only while it is attached.
        if (other.grappling) {
            ctx.strokeStyle = "rgb(255, 80, 80)";
            ctx.lineWidth = 8 / cam.zoom;
            ctx.beginPath();
            ctx.moveTo((other.x + 32 / 2 - cam.x) / cam.zoom, (other.y + 32 / 2 - cam.y) / cam.zoom);
            ctx.lineTo((other.grappleX - cam.x) / cam.zoom, (other.grappleY - cam.y) / cam.zoom);
            ctx.stroke();
        }

        ctx.fillStyle = "red";
        ctx.fillStyle = "rgb(255, 80, 80)";
        ctx.fillRect((other.x - cam.x) / cam.zoom, (other.y - cam.y) / cam.zoom, 32 / cam.zoom, 32 / cam.zoom);
        ctx.fillStyle = "rgb(0,0,0)";
        ctx.fillRect((other.x - cam.x + 4) / cam.zoom, (other.y - cam.y + 4) / cam.zoom, (32 - 8) / cam.zoom, (32 - 8) / cam.zoom);
    }

    // Draw Player
    ctx.fillStyle = "rgb(80,150,255)";
    ctx.fillRect((playerX - cam.x) / cam.zoom, (playerY - cam.y) / cam.zoom, plr.width / cam.zoom, plr.height / cam.zoom);
    ctx.fillStyle = "rgb(0,0,0)";
    ctx.fillRect((playerX - cam.x + 4) / cam.zoom, (playerY - cam.y + 4) / cam.zoom, (plr.width - 8) / cam.zoom, (plr.height - 8) / cam.zoom);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Multiplayer handling stuff

const socket = new WebSocket(
    "wss://vague-hickory-sofa.onrender.com"
);;

let myId = null;
const otherPlayers = new Map();

socket.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "welcome") {
        myId = data.id;
    }

    if (data.type === "snapshot") {
        const active = new Set();

        for (const p of data.players) {
            if (p.id === myId) continue;

            active.add(p.id);

            const other = otherPlayers.get(p.id);

            if (other) {
                other.targetX = p.x;
                other.targetY = p.y;
                other.grappleX = p.grappleX;
                other.grappleY = p.grappleY;
                other.grappling = p.grappling;
            } else {
                otherPlayers.set(p.id, {
                    x: p.x,
                    y: p.y,
                    targetX: p.x,
                    targetY: p.y,
                    grappleX: p.grappleX,
                    grappleY: p.grappleY,
                    grappling: p.grappling
                });
            }
        }

        // Remove disconnected players
        for (const id of otherPlayers.keys()) {
            if (!active.has(id)) {
                otherPlayers.delete(id);
            }
        }
    }
});

// Send your position 20 times per second
setInterval(() => {
    if (socket.readyState !== WebSocket.OPEN) return;
    if (myId === null) return;

    socket.send(JSON.stringify({
        type: "position",
        x: plr.x,
        y: plr.y,
        grappleX: plr.grappleX,
        grappleY: plr.grappleY,
        grappling: plr.grappling
    }));
}, 50);


// game loop
let lastTime = performance.now();
let physicsAccumulator = 0;

function gameLoop(now) {
    const deltaTime = Math.min(now - lastTime, MAX_FRAME_TIME);
    lastTime = now;
    physicsAccumulator += deltaTime;
    while (physicsAccumulator >= PHYSICS_STEP) {
        previousPlayerX = plr.x;
        previousPlayerY = plr.y;
        stepPhysics(PHYSICS_STEP);
        physicsAccumulator -= PHYSICS_STEP;
    }
    const interpolation = physicsAccumulator / PHYSICS_STEP;
    const playerX = previousPlayerX + (plr.x - previousPlayerX) * interpolation;
    const playerY = previousPlayerY + (plr.y - previousPlayerY) * interpolation;
    cam.glideTo(playerX + plr.width / 2 - (viewportWidth / 2 * cam.zoom), playerY + plr.height / 2 - (viewportHeight / 2 * cam.zoom), deltaTime);
    render(playerX, playerY);
    requestAnimationFrame(gameLoop);
}

document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
        lastTime = performance.now();
        physicsAccumulator = 0;
        previousPlayerX = plr.x;
        previousPlayerY = plr.y;
    }
});

requestAnimationFrame(gameLoop);
