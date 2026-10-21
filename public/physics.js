const REFERENCE_FRAME_TIME = 1000 / 60;

export function stepPhysics(player, platforms, gravity, deltaTime) {
    const frameScale = deltaTime / REFERENCE_FRAME_TIME;

    player.touching = [];
    player.vy += gravity * deltaTime;
    player.fallTime += deltaTime;

    applyGrappleForce(player, deltaTime);
    applyAirResistance(player, frameScale);
    moveHorizontally(player, platforms, deltaTime);
    moveVertically(player, platforms, deltaTime);
    applyMovementInput(player, frameScale, deltaTime);
}

function applyGrappleForce(player, deltaTime) {
    if (!player.grappling) return;

    player.vx += player.grapplePower *
        (player.grappleX - player.x - player.width / 2) *
        (deltaTime / 10);
    player.vy += player.grapplePower *
        (player.grappleY - player.y - player.height / 2) *
        (deltaTime / 10);
}

function applyAirResistance(player, frameScale) {
    const airResistance = Math.pow(0.999, frameScale);
    player.vx *= airResistance;
    player.vy *= airResistance;
}

function moveHorizontally(player, platforms, deltaTime) {
    player.x += player.vx * deltaTime;

    for (const platform of platforms) {
        if (!overlaps(player, platform)) continue;

        player.x -= player.vx * deltaTime;
        player.vx = -player.vx * platform.bounciness;
        player.touching.push(platform);
    }
}

function moveVertically(player, platforms, deltaTime) {
    player.y += player.vy * deltaTime;

    for (const platform of platforms) {
        if (!overlaps(player, platform)) continue;

        player.y -= player.vy * deltaTime;
        if (player.vy > 0) player.fallTime = 0;
        player.vy = -player.vy * platform.bounciness;
        player.touching.push(platform);
    }
}

function overlaps(player, platform) {
    return player.x < platform.x2 &&
        player.x + player.width > platform.x1 &&
        player.y + player.height > platform.y1 &&
        player.y < platform.y2;
}

function applyMovementInput(player, frameScale, deltaTime) {
    if (player.grappling) return;

    acceleratePlayer(player, deltaTime);
    applyGroundFriction(player, frameScale);
    tryJump(player);
}

function acceleratePlayer(player, deltaTime) {
    let targetVelocity = null;

    if (player.keysDown[player.moveKeys.right]) {
        targetVelocity = player.moveSpeed;
    } else if (player.keysDown[player.moveKeys.left]) {
        targetVelocity = -player.moveSpeed;
    }

    if (targetVelocity === null) return;

    const velocityDifference = targetVelocity - player.vx;
    const velocityChange = player.moveAcceleration * deltaTime;
    player.vx += Math.sign(velocityDifference) *
        Math.min(Math.abs(velocityDifference), velocityChange);
}

function applyGroundFriction(player, frameScale) {
    if (player.fallTime >= player.cayoteTime || player.touching.length === 0) return;

    const friction = player.touching[0].friction * frameScale;
    if (Math.abs(player.vx) <= friction) {
        player.vx = 0;
    } else {
        player.vx -= Math.sign(player.vx) * friction;
    }
}

function tryJump(player) {
    if (!player.keysDown[player.moveKeys.up] || player.fallTime >= player.cayoteTime) return;

    player.vy -= player.jumpPower;
    player.fallTime = player.cayoteTime;
}
