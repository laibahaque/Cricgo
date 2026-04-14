// Pitch object
import * as THREE from "three";
import { PITCH_CONFIG } from "../modules/constants.js";

export function createPitch(scene) {
    const pitch = new THREE.Mesh(
        new THREE.PlaneGeometry(PITCH_CONFIG.WIDTH, PITCH_CONFIG.LENGTH),
        new THREE.MeshBasicMaterial()
    );
    
    pitch.rotation.x = -Math.PI / 2;
    pitch.position.y = 0.005;
    scene.add(pitch);
    
    // Load texture
    new THREE.TextureLoader().load("/assets/pitch.jpg", tex => {
        pitch.material.map = tex;
        pitch.material.needsUpdate = true;
    });
    
    const pitchBox = new THREE.Box3().setFromObject(pitch);
    
    return {
        mesh: pitch,
        bounds: pitchBox
    };
}
