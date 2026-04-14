// Bat object
import * as THREE from "three";
import { BAT_CONFIG } from "../modules/constants.js";

export function createBat(scene) {
    const batGroup = new THREE.Group();
    
    // Handle
    const handleGeometry = new THREE.CylinderGeometry(0.018, 0.022, 0.40, 8);
    const handleMaterial = new THREE.MeshStandardMaterial({ color: 0x8b5a2b });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.position.y = 0;
    batGroup.add(handle);
    
    // Blade
    const bladeGeometry = new THREE.BoxGeometry(0.17, 0.70, 0.06);
    const bladeMaterial = new THREE.MeshStandardMaterial({ color: 0xf5deb3 });
    const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
    blade.position.y = -0.42;
    batGroup.add(blade);
    
    batGroup.position.set(
        BAT_CONFIG.INITIAL_POSITION.x,
        BAT_CONFIG.INITIAL_POSITION.y,
        BAT_CONFIG.INITIAL_POSITION.z
    );
    
    batGroup.rotation.set(
        BAT_CONFIG.INITIAL_ROTATION.x,
        BAT_CONFIG.INITIAL_ROTATION.y,
        BAT_CONFIG.INITIAL_ROTATION.z
    );
    
    scene.add(batGroup);
    
    batGroup.swinging = false;
    
    return {
        group: batGroup,
        blade: blade
    };
}

export function updateBatSwing(bat, delta) {
    if (!bat.group || !bat.group.swinging) return;
    
    if (!bat.group.swingTime) {
        bat.group.swingTime = 0;
        bat.group.swingStart = bat.group.rotation.z;
        bat.group.swingEnd = bat.group.swingStart - 0.9;
    }
    
    bat.group.swingTime += delta;
    const t = Math.min(bat.group.swingTime / BAT_CONFIG.SWING_DURATION, 1);
    
    bat.group.rotation.z = THREE.MathUtils.lerp(
        bat.group.swingStart,
        bat.group.swingEnd,
        t
    );
    
    if (t >= 1) {
        bat.group.rotation.z = bat.group.swingStart;
        bat.group.swinging = false;
        bat.group.swingTime = 0;
    }
}

export function startBatSwing(bat) {
    if (!bat.group.swinging) {
        bat.group.swinging = true;
        bat.group.swingStart = bat.group.rotation.z;
        bat.group.swingEnd = bat.group.swingStart - 0.9;
        bat.group.swingTime = 0;
    }
}

export function attachBatToHand(batGroup, batsman) {
    if (!batsman) return false;
    
    const rightHandBone = batsman.getObjectByName("RightHand");
    
    if (rightHandBone) {
        batGroup.parent?.remove(batGroup);
        
        // Attach to hand
        rightHandBone.add(batGroup);
        batGroup.position.set(0.05, 0.1, 0);
        batGroup.rotation.set(-Math.PI / 2, 0, Math.PI / 2);
        batGroup.scale.set(1, 1, 1);
        
        return true;
    }
    
    return false;
}

export function getBatCollisionBox(bat) {
    if (!bat.blade) return null;
    bat.blade.updateWorldMatrix(true, false);
    return new THREE.Box3().setFromObject(bat.blade);
}
