// Character models (Batsman, Bowler, Stadium)
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { BAT_CONFIG } from "../modules/constants.js";

const gltfLoader = new GLTFLoader();
const fbxLoader = new FBXLoader();

export function loadBatsman(scene) {
    return new Promise((resolve) => {
        gltfLoader.load('./models/batsman.glb', (gltf) => {
            const batsman = gltf.scene;
            batsman.scale.set(1, 1, 1);
            batsman.position.set(BAT_CONFIG.INITIAL_POSITION.x, 0, -5.8);
            scene.add(batsman);
            
            let batsmanMixer = null;
            let batsmanAction = null;
            
            if (gltf.animations.length > 0) {
                batsmanMixer = new THREE.AnimationMixer(batsman);
                batsmanAction = batsmanMixer.clipAction(gltf.animations[0]);
                batsmanAction.setLoop(THREE.LoopOnce);
                batsmanAction.clampWhenFinished = true;
            }
            
            resolve({
                model: batsman,
                mixer: batsmanMixer,
                action: batsmanAction
            });
        });
    });
}

export function loadBowler(scene) {
    return new Promise((resolve) => {
        fbxLoader.load('./models/character.fbx', (fbx) => {
            fbx.scale.setScalar(0.01);
            fbx.position.set(-1, 0, 7);
            fbx.rotation.y = Math.PI;
            scene.add(fbx);
            
            const bowlerMixer = new THREE.AnimationMixer(fbx);
            const bowlerInitialPose = [];
            
            fbx.traverse(child => {
                if (!child.isBone) return;
                bowlerInitialPose.push({
                    bone: child,
                    rotation: child.rotation.clone()
                });
            });
            
            // Adjust initial pose
            fbx.traverse(child => {
                if (!child.isBone) return;
                if (child.name.toLowerCase().includes("leftarm")) {
                    child.rotation.x = Math.PI / 5;
                    child.rotation.y = 0;
                    child.rotation.z = 0.15;
                }
                if (child.name.toLowerCase().includes("righthand")) {
                    child.rotation.x = 0;
                    child.rotation.y = 0;
                    child.rotation.z = -0.5;
                }
            });
            
            // Load bowling animation
            fbxLoader.load('./models/bowling.fbx', (bowlingFBX) => {
                let throwAction = null;
                
                if (bowlingFBX.animations.length > 0) {
                    throwAction = bowlerMixer.clipAction(bowlingFBX.animations[0]);
                    throwAction.clampWhenFinished = true;
                    throwAction.setLoop(THREE.LoopOnce);
                    
                    throwAction.onFinished = () => {
                        bowlerInitialPose.forEach(p => {
                            p.bone.rotation.copy(p.rotation);
                        });
                    };
                }
                
                resolve({
                    model: fbx,
                    mixer: bowlerMixer,
                    throwAction: throwAction,
                    initialPose: bowlerInitialPose
                });
            });
        });
    });
}

export function loadStadium(scene) {
    return new Promise((resolve) => {
        gltfLoader.load("./models/cricket_stadium.glb", (gltf) => {
            scene.add(gltf.scene);
            resolve(gltf.scene);
        });
    });
}
