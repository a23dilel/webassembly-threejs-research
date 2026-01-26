import * as THREE from 'three';
import { PARAMS } from './gui';
import { Particles } from './particles';
import { CameraController } from './cameraController';

let lastTime = performance.now();
let frames = 0;
let fps = 0;
const RESPONSIVE_FPS = 1000;

let scene;
let particles; 

function createGeometry(params = {}) {
    const {type, count, size, color, posBounds, speed} = params;
    
    scene = new THREE.Scene();
    
    if (particles) {
        scene.remove(particles.mesh);
        particles.disposeGeometry?.();
    } 
    particles = new Particles({ type, count, size, color, posBounds, speed });
    scene.add( particles.mesh );
}

function initThreeJS() {
    // Set the scene size
    const WIDTH = window.innerWidth;
    const HEIGHT = window.innerHeight;

    scene = new THREE.Scene();

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize( WIDTH, HEIGHT, true);
    renderer.setAnimationLoop ( animate );
    document.body.appendChild( renderer.domElement );

    let cameraController = new CameraController({ renderer, aspect: WIDTH/HEIGHT});
    cameraController.bindEvents();
    cameraController.camera.position.z = 60;
    
    createGeometry(PARAMS);

    const clock = new THREE.Clock();
    function animate() {
        let deltaTime = clock.getDelta();

        particles.update(deltaTime);
        cameraController.update(deltaTime);

        renderer.render( scene, cameraController.camera );

        // FPS calculation
        frames++;
        const now = performance.now();
        if (now - lastTime >= RESPONSIVE_FPS) {
            fps = Math.round((frames * 1000) / (now - lastTime));
            frames = 0;
            lastTime = now;
        }

        PARAMS.fps = fps;
        PARAMS.calls = renderer.info.render.calls;
        PARAMS.triangles = renderer.info.render.triangles;
        PARAMS.geometries = renderer.info.memory.geometries;
        PARAMS.textures = renderer.info.memory.textures;
        
        if (performance.memory) {
            PARAMS.JsHeapMB = performance.memory.usedJSHeapSize / 1048576;
        }
    }
}

export { initThreeJS, createGeometry }