// Input handling and controls
import { MOVEMENT_KEYS, MOVEMENT_SPEED } from "../constants.js";

export function createMovementState() {
    return {
        forward: false,
        backward: false,
        left: false,
        right: false,
        up: false,
        down: false
    };
}

export function setupKeyboardControls(movement, onKeyDown = null, onKeyUp = null, onMotorMovement = null) {
    function handleKeyDown(e) {
        let moved = false;
        
        switch (e.code) {
            case MOVEMENT_KEYS.FORWARD: movement.forward = true; moved = true; break;
            case MOVEMENT_KEYS.BACKWARD: movement.backward = true; moved = true; break;
            case MOVEMENT_KEYS.LEFT: 
                movement.left = true; 
                moved = true; 
                if (onMotorMovement) onMotorMovement('batsman_left');
                break;
            case MOVEMENT_KEYS.RIGHT: 
                movement.right = true; 
                moved = true; 
                if (onMotorMovement) onMotorMovement('batsman_right');
                break;
            case MOVEMENT_KEYS.DOWN: movement.down = true; moved = true; break;
            case MOVEMENT_KEYS.UP: movement.up = true; moved = true; break;
        }
        
        if (moved && onKeyDown) onKeyDown(e);
    }
    
    function handleKeyUp(e) {
        let moved = false;
        
        switch (e.code) {
            case MOVEMENT_KEYS.FORWARD: movement.forward = false; moved = true; break;
            case MOVEMENT_KEYS.BACKWARD: movement.backward = false; moved = true; break;
            case MOVEMENT_KEYS.LEFT: movement.left = false; moved = true; break;
            case MOVEMENT_KEYS.RIGHT: movement.right = false; moved = true; break;
            case MOVEMENT_KEYS.DOWN: movement.down = false; moved = true; break;
            case MOVEMENT_KEYS.UP: movement.up = false; moved = true; break;
        }
        
        if (moved && onKeyUp) onKeyUp(e);
    }
    
    return { handleKeyDown, handleKeyUp };
}

export function updateCameraMovement(camera, movement) {
    let moveX = 0, moveY = 0, moveZ = 0;
    
    if (movement.forward) moveZ -= MOVEMENT_SPEED;
    if (movement.backward) moveZ += MOVEMENT_SPEED;
    if (movement.left) moveX -= MOVEMENT_SPEED;
    if (movement.right) moveX += MOVEMENT_SPEED;
    if (movement.up) moveY += MOVEMENT_SPEED;
    if (movement.down) moveY -= MOVEMENT_SPEED;
    
    if (moveX !== 0 || moveY !== 0 || moveZ !== 0) {
        const dir = new THREE.Vector3();
        camera.getWorldDirection(dir);
        dir.y = 0;
        dir.normalize();
        
        const right = new THREE.Vector3();
        right.crossVectors(camera.up, dir).normalize();
        
        camera.position.addScaledVector(dir, moveZ);
        camera.position.addScaledVector(right, moveX);
        camera.position.y += moveY;
    }
}

export function isAnyPopupOpen() {
    const popups = [
        document.getElementById('name-popup'),
        document.getElementById('outPopup'),
        document.getElementById('sixPopup'),
        document.getElementById('fourPopup'),
    ];
    
    return popups.some(p => p && (p.style.display !== 'none' && !p.classList.contains('hidden')));
}
