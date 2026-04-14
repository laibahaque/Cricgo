// Wickets and bails setup
import * as THREE from "three";
import { WICKET_CONFIG, BAIL_CONFIG } from "../constants.js";

export function createWickets(scene) {
    const wicketMeshes = [];
    const wicketBoxes = [];
    
    // Bowler's end wickets
    WICKET_CONFIG.BOWLER_POSITIONS.forEach(pos => {
        const wicket = new THREE.Mesh(
            new THREE.CylinderGeometry(WICKET_CONFIG.RADIUS, WICKET_CONFIG.RADIUS, WICKET_CONFIG.HEIGHT, 16),
            new THREE.MeshBasicMaterial({ color: "#faf2d1" })
        );
        
        wicket.position.set(pos.x, pos.y + 0.6, pos.z);
        scene.add(wicket);
        wicketMeshes.push(wicket);
        wicketBoxes.push(new THREE.Box3().setFromObject(wicket));
    });
    
    // Striker's end wickets
    WICKET_CONFIG.STRIKER_POSITIONS.forEach(pos => {
        const wicket = new THREE.Mesh(
            new THREE.CylinderGeometry(WICKET_CONFIG.RADIUS, WICKET_CONFIG.RADIUS, WICKET_CONFIG.HEIGHT, 16),
            new THREE.MeshBasicMaterial({ color: "#faf2d1" })
        );
        
        wicket.position.set(pos.x, pos.y + 0.6, pos.z);
        scene.add(wicket);
    });
    
    return {
        meshes: wicketMeshes,
        boxes: wicketBoxes
    };
}

export function createBails(scene) {
    const bailMeshes = [];
    
    // Helper function to create a single bail
    const createBailMesh = (x, z) => {
        const bail = new THREE.Mesh(
            new THREE.CylinderGeometry(BAIL_CONFIG.RADIUS, BAIL_CONFIG.RADIUS, BAIL_CONFIG.HEIGHT, 8),
            new THREE.MeshBasicMaterial({ color: "#faf2d1" })
        );
        
        bail.rotation.z = Math.PI / 2;
        bail.position.set(x, BAIL_CONFIG.INITIAL_Y, z);
        scene.add(bail);
        return bail;
    };
    
    // Create bowler's end bails
    const bowlerBails = BAIL_CONFIG.BOWLER_POSITIONS.map(pos => 
        createBailMesh(pos.x, pos.z)
    );
    
    // Create striker's end bails
    BAIL_CONFIG.STRIKER_POSITIONS.forEach(pos => 
        createBailMesh(pos.x, pos.z)
    );
    
    const bailBoxes = bowlerBails.map(bail => 
        new THREE.Box3().setFromObject(bail)
    );
    
    return {
        meshes: bowlerBails,
        boxes: bailBoxes,
        fallVelocity: BAIL_CONFIG.FALL_VELOCITY
    };
}

export function resetBails(bails) {
    // Reset bowler's end bails
    const positions = BAIL_CONFIG.BOWLER_POSITIONS;
    bails.meshes.forEach((bail, index) => {
        bail.position.set(positions[index].x, BAIL_CONFIG.INITIAL_Y, positions[index].z);
        bail.rotation.set(0, 0, Math.PI / 2);
        bails.boxes[index].setFromObject(bail);
    });
}
