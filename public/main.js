import Camera from "./camera.js";
import ChatUI from "./chat.js";
import Controls from "./controls.js";
import MultiplayerClient from "./multiplayer.js";
import { stepPhysics } from "./physics.js";
import Player from "./player.js";
import Renderer from "./renderer.js";
import { GRAVITY, images, platforms } from "./world.js";

const PHYSICS_STEP = 1000 / 120;
const MAX_FRAME_TIME = 50;

const mainMenu = document.getElementById("mainMenu");
const startButton = document.getElementById("startButton");
const usernameInput = document.getElementById("nameInput");
const colorInput = document.getElementById("colorInput");
const canvas = document.getElementById("gameCanvas");

const player = new Player(0, 0);
const camera = new Camera(player);

let chat;
let controls;

const multiplayer = new MultiplayerClient({
    onChatMessage: (author, message) => chat.addMessage(author, message)
});

chat = new ChatUI({
    onSend: (message) => multiplayer.sendChatMessage(message),
    onFocus: () => controls.stopPlayerInput()
});

const renderer = new Renderer({
    canvas,
    player,
    camera,
    platforms,
    images,
    otherPlayers: multiplayer.otherPlayers
});

let previousPlayerX = player.x;
let previousPlayerY = player.y;
let lastFrameTime = performance.now();
let physicsAccumulator = 0;
let gameStarted = false;

controls = new Controls({
    player,
    camera,
    platforms,
    chat,
    mainMenu,
    getViewport: () => ({
        width: renderer.viewportWidth,
        height: renderer.viewportHeight
    }),
    onReset: syncPreviousPlayerPosition
});

function syncPreviousPlayerPosition() {
    previousPlayerX = player.x;
    previousPlayerY = player.y;
}

function gameLoop(now) {
    const deltaTime = Math.min(now - lastFrameTime, MAX_FRAME_TIME);
    lastFrameTime = now;
    physicsAccumulator += deltaTime;

    while (physicsAccumulator >= PHYSICS_STEP) {
        syncPreviousPlayerPosition();
        stepPhysics(player, platforms, GRAVITY, PHYSICS_STEP);
        physicsAccumulator -= PHYSICS_STEP;
    }

    const interpolation = physicsAccumulator / PHYSICS_STEP;
    const playerX = previousPlayerX + (player.x - previousPlayerX) * interpolation;
    const playerY = previousPlayerY + (player.y - previousPlayerY) * interpolation;

    camera.glideTo(
        playerX + player.width / 2 - renderer.viewportWidth / 2 * camera.zoom,
        playerY + player.height / 2 - renderer.viewportHeight / 2 * camera.zoom,
        deltaTime
    );
    renderer.render(playerX, playerY);
    requestAnimationFrame(gameLoop);
}

function startGame() {
    if (gameStarted) return;

    const username = usernameInput.value.trim();
    if (username.length < 2 || username.length > 16) return;

    gameStarted = true;
    player.color = colorInput.value;
    mainMenu.style.display = "none";

    chat.show();
    chat.addMessage("", "Press / at any time to start chatting.", { system: true });

    multiplayer.sendInitialState(username, player.color);
    multiplayer.startPositionUpdates(player);

    syncPreviousPlayerPosition();
    lastFrameTime = performance.now();
    physicsAccumulator = 0;
    requestAnimationFrame(gameLoop);
}

function handleVisibilityChange() {
    if (document.hidden) return;

    lastFrameTime = performance.now();
    physicsAccumulator = 0;
    syncPreviousPlayerPosition();
}

window.addEventListener("resize", () => renderer.resize());
document.addEventListener("visibilitychange", handleVisibilityChange);
startButton.addEventListener("click", startGame);

// Useful for server integrations and browser-console debugging.
window.addChatMessage = (...args) => chat.addMessage(...args);

renderer.resize();
renderer.render();
