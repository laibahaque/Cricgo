// Ground object
import * as THREE from "three";
import { GROUND_CONFIG } from "../modules/constants.js";

export function createGround(scene) {
    const groundGeometry = new THREE.CircleGeometry(GROUND_CONFIG.RADIUS, GROUND_CONFIG.SEGMENTS);
    const ground = new THREE.Mesh(
        groundGeometry,
        new THREE.MeshBasicMaterial()
    );
    
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);
    
    // Load texture
    new THREE.TextureLoader().load("/assets/grass-cric.jpg", tex => {
        ground.material.map = tex;
        ground.material.needsUpdate = true;
    });
    
    return {
        mesh: ground,
        radius: GROUND_CONFIG.RADIUS,
        boundaryRadius: GROUND_CONFIG.RADIUS * GROUND_CONFIG.BOUNDARY_RADIUS_FACTOR
    };
}
