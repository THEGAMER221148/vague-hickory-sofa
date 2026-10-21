export default class Controls {
    constructor({ player, camera, platforms, chat, mainMenu, getViewport, onReset }) {
        this.player = player;
        this.camera = camera;
        this.platforms = platforms;
        this.chat = chat;
        this.mainMenu = mainMenu;
        this.getViewport = getViewport;
        this.onReset = onReset;

        window.addEventListener("keydown", (event) => this.handleKeyDown(event));
        window.addEventListener("keyup", (event) => this.handleKeyUp(event));
        window.addEventListener("mousedown", (event) => this.handleMouseDown(event));
        window.addEventListener("mouseup", () => this.handleMouseUp());
        window.addEventListener("mousemove", (event) => this.handleMouseMove(event));
        window.addEventListener("wheel", (event) => this.handleWheel(event));
    }

    stopPlayerInput() {
        this.player.keysDown = {};
        this.player.grappling = false;
    }

    handleKeyDown(event) {
        if (isTextEntryTarget(event.target)) {
            if (event.key === "Escape") event.target.blur();
            return;
        }

        if (event.key === "/" && this.mainMenu.style.display === "none") {
            event.preventDefault();
            this.stopPlayerInput();
            this.chat.focus();
            return;
        }

        const key = event.key.toLowerCase();
        this.player.keysDown[key] = true;

        if (key === "r") this.resetPlayer();
        if (key === " " && !this.player.grappling && this.player.canGrapple) {
            this.grapple();
        }
    }

    handleKeyUp(event) {
        const key = event.key.toLowerCase();
        this.player.keysDown[key] = false;
        if (key === " ") this.player.grappling = false;
    }

    handleMouseDown(event) {
        if (this.chat.isFocused || isUiElement(event.target)) return;

        this.player.mouse.down = true;
        this.player.mouse.button = event.button;
        this.player.mouse.x = event.clientX;
        this.player.mouse.y = event.clientY;

        if (this.player.canGrapple && !this.player.grappling) this.grapple();
    }

    handleMouseUp() {
        this.player.mouse.down = false;
        this.player.grappling = false;
    }

    handleMouseMove(event) {
        this.player.mouse.x = event.clientX;
        this.player.mouse.y = event.clientY;
    }

    handleWheel(event) {
        if (this.chat.isFocused || isChatElement(event.target)) return;

        this.camera.zoom += event.deltaY / 100;
        if (this.camera.zoom < 0.1) this.camera.zoom -= event.deltaY / 100;

        const { width, height } = this.getViewport();
        this.camera.moveTo(
            this.player.x + this.player.width / 2 - width / 2 * this.camera.zoom,
            this.player.y + this.player.height / 2 - height / 2 * this.camera.zoom
        );
    }

    resetPlayer() {
        Object.assign(this.player, {
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            width: 32,
            height: 32,
            moveSpeed: 0.25,
            moveAcceleration: 0.002,
            fallTime: 0,
            cayoteTime: 250,
            jumpPower: 0.5,
            touching: []
        });
        this.onReset();
    }

    grapple() {
        const player = this.player;
        player.grappleX = player.x + player.width / 2;
        player.grappleY = player.y + player.height / 2;

        const mouseWorld = this.camera.screenToWorld(player.mouse.x, player.mouse.y);
        const angle = Math.atan2(
            mouseWorld.y - player.grappleY,
            mouseWorld.x - player.grappleX
        );
        const dx = Math.cos(angle);
        const dy = Math.sin(angle);

        for (let distance = 0; distance < player.maxGrappleLength; distance += 1) {
            player.grappleX += dx * player.grappleStep;
            player.grappleY += dy * player.grappleStep;

            if (this.grappleHitsPlatform()) {
                player.grappling = true;
                return;
            }
        }
    }

    grappleHitsPlatform() {
        return this.platforms.some((platform) =>
            this.player.grappleX < platform.x2 &&
            this.player.grappleX > platform.x1 &&
            this.player.grappleY > platform.y1 &&
            this.player.grappleY < platform.y2
        );
    }
}

function isTextEntryTarget(target) {
    return target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable;
}

function isUiElement(target) {
    return target instanceof Element && Boolean(target.closest("#mainMenu, #chatPanel"));
}

function isChatElement(target) {
    return target instanceof Element && Boolean(target.closest("#chatPanel"));
}
