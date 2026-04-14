// Lighting setup
import * as THREE from "three";
import { LIGHTING } from "../modules/constants.js";

export function createLights(scene) {
    const ambientLight = new THREE.AmbientLight(LIGHTING.AMBIENT_COLOR, LIGHTING.AMBIENT_INTENSITY);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(LIGHTING.DIRECTIONAL_COLOR, LIGHTING.DIRECTIONAL_INTENSITY);
    directionalLight.position.set(
        LIGHTING.DIRECTIONAL_POSITION.x,
        LIGHTING.DIRECTIONAL_POSITION.y,
        LIGHTING.DIRECTIONAL_POSITION.z
    );
    scene.add(directionalLight);
    
    return {
        ambient: ambientLight,
        directional: directionalLight
    };
}
