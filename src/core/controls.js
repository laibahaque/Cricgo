// Camera controls setup
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export function createControls(camera, renderer) {
    const controls = new OrbitControls(camera, renderer.domElement);
    return controls;
}
