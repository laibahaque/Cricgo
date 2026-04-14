// Bowling trajectory and ball movement
import * as THREE from "three";

export function createBowlingTrajectory() {
    return {
        bouncePoint: new THREE.Vector3(0, 0.1, 0),
        ballStart: new THREE.Vector3(-0.4, 0.85, 6.75),
        ballEnd: new THREE.Vector3(0, 0.3, -8),
        currentDirection: 0
    };
}

export function setRandomBowlingDirection(trajectory) {
    trajectory.currentDirection = Math.floor(Math.random() * 3);
    
    switch (trajectory.currentDirection) {
        case 0:
            trajectory.ballEnd.set(0, 0.3, -8);
            trajectory.bouncePoint.set(0, 0.1, 0);
            break;
        case 1:
            trajectory.ballEnd.set(-1.2, 0.3, -8);
            trajectory.bouncePoint.set(-0.8, 0.1, 0);
            break;
        case 2:
            trajectory.ballEnd.set(1.2, 0.3, -8);
            trajectory.bouncePoint.set(0.8, 0.1, 0);
            break;
    }
    
    return trajectory;
}

export function calculateBallTrajectory(delta, t, trajectory, ballSpeed) {
    const d1 = trajectory.ballStart.distanceTo(trajectory.bouncePoint);
    const d2 = trajectory.bouncePoint.distanceTo(trajectory.ballEnd);
    const totalDistance = d1 + d2;
    
    const BALL_TIME_SCALE = 3.5;
    const travelTime = (totalDistance / ballSpeed) * BALL_TIME_SCALE;
    
    const bounceT = d1 / totalDistance;
    
    const ballPosition = new THREE.Vector3();
    
    if (t < bounceT) {
        const localT = t / bounceT;
        
        ballPosition.x = THREE.MathUtils.lerp(trajectory.ballStart.x, trajectory.bouncePoint.x, localT);
        ballPosition.z = THREE.MathUtils.lerp(trajectory.ballStart.z, trajectory.bouncePoint.z, localT);
        
        const height1 = 1.4;
        ballPosition.y =
            THREE.MathUtils.lerp(trajectory.ballStart.y, trajectory.bouncePoint.y, localT) +
            height1 * 4 * localT * (1 - localT);
    } else {
        const localT = (t - bounceT) / (1 - bounceT);
        
        ballPosition.x = THREE.MathUtils.lerp(trajectory.bouncePoint.x, trajectory.ballEnd.x, localT);
        ballPosition.z = THREE.MathUtils.lerp(trajectory.bouncePoint.z, trajectory.ballEnd.z, localT);
        
        const height2 = 1;
        ballPosition.y =
            THREE.MathUtils.lerp(trajectory.bouncePoint.y, trajectory.ballEnd.y, localT) +
            height2 * 4 * localT * (1 - localT);
    }
    
    return { ballPosition, travelTime };
}

export function kmhToMs(kmh) {
    return kmh / 3.6;
}
