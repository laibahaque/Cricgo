// Collision detection and game mechanics
import * as THREE from "three";
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

    // =======================================
    // STATE INITIALIZATION
    // =======================================
    if (batsman.userData.wasMoving === undefined) {
        batsman.userData.wasMoving = false;
        batsman.userData.lerpTargetX = null;
        batsman.userData.lerpStartX = null;
        batsman.userData.lerpT = 0;
        batsman.userData.activeBall = null;
        batsman.userData.hasCompletedMove = false;
    }

    const currentX = batsman.position.x;
    const MOVEMENT_THRESHOLD = 0.01;
    const currentBallNumber = window.currentBall || 0;

    // =======================================
    // 🔄 NEW BALL DETECTION
    // Reset movement state when ball changes
    // =======================================
    if (batsman.userData.activeBall !== currentBallNumber) {
        batsman.userData.activeBall = currentBallNumber;
        batsman.userData.hasCompletedMove = false;
        batsman.userData.wasMoving = false;
        batsman.userData.lerpT = 0;
        batsman.userData.lerpTargetX = null;
        batsman.userData.lerpStartX = null;
    }

    // =======================================
    // DETERMINE IF MOVEMENT IS NEEDED
    // =======================================
    const calculatedTargetX = THREE.MathUtils.clamp(
        ballPosition.x,
        minX,
        maxX
    );

    const distanceToCalculatedTarget = Math.abs(calculatedTargetX - currentX);
    const shouldMove = distanceToCalculatedTarget > MOVEMENT_THRESHOLD;

    // =======================================
    // STATE TRANSITION: IDLE → MOVING
    // FREEZE positions A and B, initialize t=0
    // =======================================
    if (shouldMove && !batsman.userData.wasMoving && !batsman.userData.hasCompletedMove) {
        batsman.userData.lerpStartX = currentX;      // A: start position
        batsman.userData.lerpTargetX = calculatedTargetX; // B: target position
        batsman.userData.lerpT = 0;                  // t starts at 0
        batsman.userData.wasMoving = true;

        console.log("🟢 LERP START - Ball", currentBallNumber);
        console.log("A (Start X):", batsman.userData.lerpStartX);
        console.log("B (Target X):", batsman.userData.lerpTargetX);
        console.log("t: 0 → movement begins");

        if (window.lerpDetector) {
            window.lerpDetector.startBatsmanLerp(
                batsman.userData.lerpStartX,
                batsman.userData.lerpTargetX,
                currentBallNumber
            );
        }
    }

    // =======================================
    // 🎮 TRUE LERP MOVEMENT
    // position = (1 - t) * A + t * B
    // =======================================
    if (batsman.userData.wasMoving && batsman.userData.lerpTargetX !== null) {
        const A = batsman.userData.lerpStartX;
        const B = batsman.userData.lerpTargetX;
        const maxDuration = Math.abs(B - A) / 4; // Approximate duration based on distance

        // Increment t over time
        batsman.userData.lerpT += delta / maxDuration;
        batsman.userData.lerpT = Math.min(batsman.userData.lerpT, 1); // Clamp to [0, 1]

        // TRUE LERP FORMULA
        batsman.position.x = (1 - batsman.userData.lerpT) * A + batsman.userData.lerpT * B;

        console.log(`t: ${batsman.userData.lerpT.toFixed(3)}, X: ${batsman.position.x.toFixed(3)}`);
    }

    // =======================================
    // STATE TRANSITION: MOVING → IDLE
    // When t >= 1, movement is complete
    // =======================================
    if (batsman.userData.wasMoving && batsman.userData.lerpT >= 1) {
        batsman.userData.wasMoving = false;
        batsman.userData.hasCompletedMove = true;

        const endX = batsman.position.x;
        const startX = batsman.userData.lerpStartX;
        const lerpMidpoint = (1 - 0.5) * startX + 0.5 * endX; // t=0.5

        console.log("🔴 LERP END - Ball", currentBallNumber);
        console.log("Final X:", endX);
        console.log("Distance traveled:", Math.abs(endX - startX));
        console.log("t=0.5 value (midpoint):", lerpMidpoint.toFixed(3));

        if (window.lerpDetector) {
            window.lerpDetector.endBatsmanLerp(
                currentBallNumber,
                endX
            );
        }

        // Reset tracking data
        batsman.userData.lerpStartX = null;
        batsman.userData.lerpTargetX = null;
        batsman.userData.lerpT = 0;
    }

    // =======================================
    // ⚡ SNAP LOGIC (original behavior)
    // =======================================
    if (ballPosition.z < -5.3) {
        batsman.position.x = calculatedTargetX;
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

export function handleWicketHit() {
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
