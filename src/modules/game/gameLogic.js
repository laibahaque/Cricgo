// Collision detection and game mechanics
import * as THREE from "three";
import { PROBABILITY_CONFIG } from "../constants.js";
import { updateScore, showSixPopup, showOutPopup, showFourPopup } from "../../ui/ui.js";

export function checkBallWicketCollision(ball, wicketBoxes, wicketMeshes) {
    const ballSphere = new THREE.Sphere();
    ballSphere.center.copy(ball.position);
    ballSphere.radius = 0.1;

    for (let i = 0; i < wicketBoxes.length; i++) {
        wicketBoxes[i].setFromObject(wicketMeshes[i]);
        if (wicketBoxes[i].intersectsSphere(ballSphere)) {
            return true;
        }
    }

    return false;
}

export function checkBatBallCollision(ball, bat, previousBallPosition) {
    if (ball.position.z > -5.2) return false;

    if (!bat || !bat.blade || !bat.group) return false;

    if (bat.group && bat.group.updateWorldMatrix) {
        bat.group.updateWorldMatrix(true, false);
    }

    if (bat.blade && bat.blade.updateWorldMatrix) {
        bat.blade.updateWorldMatrix(true, false);
    }

    const batBladeWorldPos = new THREE.Vector3();
    bat.blade.getWorldPosition(batBladeWorldPos);

    const batCollisionRadius = 0.3;
    const distToBall = ball.position.distanceTo(batBladeWorldPos);

    if (distToBall < batCollisionRadius) {
        const batBox = new THREE.Box3().setFromObject(bat.blade);

        const direction = new THREE.Vector3()
            .subVectors(ball.position, previousBallPosition);

        if (direction.lengthSq() > 0.00001) {
            const ray = new THREE.Ray(
                previousBallPosition.clone(),
                direction.clone().normalize()
            );

            const intersectionPoint = new THREE.Vector3();

            if (ray.intersectBox(batBox, intersectionPoint) &&
                intersectionPoint.distanceTo(previousBallPosition) <= direction.length()) {
                return true;
            }
        }


        return true;
    }

    return false;
}

export function updateBatsmanPosition(batsman, ballPosition, minX, maxX, speed, delta) {
    if (!batsman) return;

    const targetX = THREE.MathUtils.clamp(
        ballPosition.x,
        minX,
        maxX
    );

    const currentX = batsman.position.x;

    // ===============================
    // 🧠 BATSMAN LERP START TRACKING
    // ===============================
    if (!batsman.userData.lerpActive) {
        batsman.userData.lerpActive = true;

        batsman.userData.lerpStartX = currentX;
        batsman.userData.lerpStartTime = performance.now();
console.log("🟢 LERP START");
    console.log("Start X:", currentX);
    console.log("Target X:", targetX);

        if (window.lerpDetector) {
            window.lerpDetector.startBatsmanLerp(
                currentX,
                targetX,
                window.currentBall || 0
            );
        }
    }

    // ===============================
    // 🎮 MOVEMENT (LERP)
    // ===============================
    batsman.position.x +=
        (targetX - batsman.position.x) *
        Math.min(1, speed * delta);

    // ===============================
    // 🧠 BATSMAN LERP END TRACKING
    // ===============================
    const reachedTarget = Math.abs(targetX - batsman.position.x) < 0.01;

    if (reachedTarget && batsman.userData.lerpActive) {
        batsman.userData.lerpActive = false;

        const endTime = performance.now();
        const duration = endTime - batsman.userData.lerpStartTime;

        const distance = Math.abs(targetX - batsman.userData.lerpStartX);

        if (window.lerpDetector) {
            window.lerpDetector.endBatsmanLerp(
                window.currentBall || 0,
                batsman.position.x
            );
        }

        // reset
        batsman.userData.lerpStartX = null;
        batsman.userData.lerpStartTime = null;
    }

    // ===============================
    // ⚡ SNAP LOGIC (your original behavior)
    // ===============================
    if (ballPosition.z < -5.3) {
        batsman.position.x = targetX;
    }
}


export function handleBallHit(ball, score, increment = 6) {
    score += increment;
    updateScore(score);

    if (increment === 6) {
        showSixPopup();
        ball.userData.scoredSix = true;
        // Update ticker for six
        if (window.ticker) {
            window.ticker.onScore(6);
        }
    } else if (increment === 4) {
        showFourPopup();
        ball.userData.fourAwarded = true;
        // Update ticker for four
        if (window.ticker) {
            window.ticker.onScore(4);
        }
    }

    return score;
}

export function handleWicketHit(clapAction) {
    if (typeof clapAction !== 'undefined' && clapAction) {
        clapAction.reset();
        clapAction.play();
    }
    showOutPopup();
}

export function calculateHitPower(ballSpeed) {
    let power = 0;
    let height = 0;
    let isSix = false;

    const luck = Math.random();

    if (ballSpeed < 95) {
        if (luck > 0.9) isSix = true;
        power = isSix ? 24 : 8 + Math.random() * 2;
        height = isSix ? 1.1 : 0.12;
    } else if (ballSpeed < 125) {
        if (luck > 0.7) isSix = true;
        power = isSix ? 26 : 10 + Math.random() * 3;
        height = isSix ? 1.15 : 0.18;
    } else {
        if (luck > 0.45) isSix = true;
        power = isSix ? 28 : 11 + Math.random() * 3;
        height = isSix ? 1.2 : 0.22;
    }

    return { power, height, isSix };
}

export function updateBailPhysics(bails, delta, pitchBounds) {
    bails.meshes.forEach((bail, index) => {
        bail.position.y += bails.fallVelocity;

        if (index === 0) {
            bail.rotation.z -= 0.02;
        } else {
            bail.rotation.z += 0.2;
        }

        bails.boxes[index].setFromObject(bail);

        if (bails.boxes[index].intersectsBox(pitchBounds)) {
            return true; // Stop falling
        }
    });
}
