// Camera setup and resize handling
import * as THREE from "three";
import { SCENE_CONFIG, CAMERA_POSITION } from "../modules/constants.js";

export function createCamera() {
    const camera = new THREE.PerspectiveCamera(
        SCENE_CONFIG.fov,
        window.innerWidth / window.innerHeight,
        SCENE_CONFIG.near,
        SCENE_CONFIG.far
    );
    
    camera.position.set(CAMERA_POSITION.x, CAMERA_POSITION.y, CAMERA_POSITION.z);
    
    return camera;
}

export function setupCameraResize(camera, renderer) {
    function onWindowResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }
    
    window.addEventListener("resize", onWindowResize);
    
    return onWindowResize;
}
