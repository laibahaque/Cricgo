// Ball object
import * as THREE from "three";
import { BALL_CONFIG } from "../modules/constants.js";

export function createBall(scene) {
    const ball = new THREE.Mesh(
        new THREE.SphereGeometry(BALL_CONFIG.RADIUS, BALL_CONFIG.GEOMETRY_SEGMENTS, BALL_CONFIG.GEOMETRY_SEGMENTS),
        new THREE.MeshBasicMaterial({
            map: new THREE.TextureLoader().load("/assets/texture.jpg")
        })
    );
    
    scene.add(ball);
    
    // Initialize ball state
    ball.userData = {
        state: "bowling",
        velocity: null,
        hasTouchedGround: false,
        scoredSix: false,
        scoredWide: false,
        fourAwarded: false
    };
    
    ball.position.set(BALL_CONFIG.START_POSITION.x, BALL_CONFIG.START_POSITION.y, BALL_CONFIG.START_POSITION.z);
    
    return ball;
}

export function updateBallPhysics(ball, delta) {
    if (!ball.userData.velocity) return;
    
    const gravity = BALL_CONFIG.GRAVITY;
    const groundY = BALL_CONFIG.GROUND_Y;
    const ballRadius = BALL_CONFIG.RADIUS;
    const friction = BALL_CONFIG.FRICTION;
    
    // Apply gravity
    ball.userData.velocity.y -= gravity * delta;
    
    // Apply friction
    ball.userData.velocity.x *= friction;
    ball.userData.velocity.z *= friction;
    
    // Calculate next position
    const nextPosition = ball.position.clone().addScaledVector(ball.userData.velocity, delta);
    
    // Ground collision
    if (nextPosition.y <= groundY + ballRadius) {
        nextPosition.y = groundY + ballRadius;
        
        if (!ball.userData.hasTouchedGround) {
            ball.userData.hasTouchedGround = true;
        }
        
        if (Math.abs(ball.userData.velocity.y) < BALL_CONFIG.VELOCITY_THRESHOLD) {
            ball.userData.velocity.y = 0;
        }
    }
    
    ball.position.copy(nextPosition);
    
    if (
        ball.position.y <= groundY + ballRadius + 0.001 &&
        Math.abs(ball.userData.velocity.y) === 0 &&
        Math.abs(ball.userData.velocity.x) < 0.2 &&
        Math.abs(ball.userData.velocity.z) < 0.2
    ) {
        ball.userData.velocity = null;
    }
}

export function resetBallPosition(ball, startPosition) {
    ball.position.set(startPosition.x, startPosition.y, startPosition.z);
    ball.userData.velocity = null;
    ball.userData.hasTouchedGround = false;
    ball.userData.scoredSix = false;
    ball.userData.scoredWide = false;
    ball.userData.fourAwarded = false;
}

export function checkBoundaryCollision(ball, groundRadius) {
    const distanceFromCenter = Math.sqrt(
        ball.position.x * ball.position.x + ball.position.z * ball.position.z
    );
    
    const boundaryRadius = groundRadius * 0.9;
    
    if (distanceFromCenter > boundaryRadius) {
        const angle = Math.atan2(ball.position.z, ball.position.x);
        ball.position.x = Math.cos(angle) * (boundaryRadius);
        ball.position.z = Math.sin(angle) * (boundaryRadius);
    }
    
    return distanceFromCenter;
}
