// Scene initialization and setup
import { createScene } from "../../core/scene.js";
import { createCamera, setupCameraResize } from "../../core/camera.js";
import { createLights } from "../../core/lights.js";
import { createRenderer } from "../../core/renderer.js";
import { createControls } from "../../core/controls.js";

export function createSceneEnvironment() {
    const scene = createScene();
    const camera = createCamera();
    const renderer = createRenderer();
    createLights(scene);
    const controls = createControls(camera, renderer);

    // Setup camera resize handling
    setupCameraResize(camera, renderer);
    
    return {
        scene,
        camera,
        renderer,
        controls
    };
}

export { setupCameraResize } from "../../core/camera.js";
