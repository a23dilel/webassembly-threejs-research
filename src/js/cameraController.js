import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

class CameraController {
    constructor({ fov = 75, aspect = 1920/1080, near = 0.1, far = 1000, speed = 10, renderer } = {} ) {
        this.fov = fov;
        this.aspect = aspect;
        this.near = near;
        this.far = far;
        this.speed = speed;
        this.move = {
            forward: false,
            backward: false,
            right: false,
            left: false,
            up: false,
            down: false
        }

        this.camera = new THREE.PerspectiveCamera(this.fov, this.aspect, this.near, this.far);

        if (!renderer) {
            throw new Error('CameraController requires a renderer');
        } else {
            this.controls = new PointerLockControls(this.camera, renderer.domElement);
        }
    }

    bindEvents() {
        const { controls, move } = this;
        
        // Click to lock pointer and start moving
        document.addEventListener('click', () => {
            if (controls.isLocked) {
                controls.unlock();
            } else {
                controls.lock();
            }
        });
        
        document.addEventListener('keydown', (event) => {
            switch (event.code) {
                case 'KeyW':
                    move.forward = true;
                    break;
                case 'KeyS':
                    move.backward = true;
                    break;
                case 'KeyD':
                    move.right = true;
                    break;
                case 'KeyA':
                    move.left = true;
                    break;
                case 'Space':
                    move.up = true;
                    break;
                case 'KeyC':
                    move.down = true;
                    break;
            }
        });

        document.addEventListener('keyup', (event) => {
            switch (event.code) {
                case 'KeyW':
                    move.forward = false;
                    break;
                case 'KeyS':
                    move.backward = false;
                    break;
                case 'KeyD':
                    move.right = false;
                    break;
                case 'KeyA':
                    move.left = false;
                    break;
                case 'Space':
                    move.up = false;
                    break;
                case 'KeyC':
                    move.down = false;
                    break;
            }
        });
    }

    update(deltaTime) {
        const { move, controls, camera } = this;
        let speed = this.speed * deltaTime;

        if(move.forward) {
            controls.moveForward(speed);
        }
        if(move.backward) {
            controls.moveForward(-speed);
        }
        if(move.right) {
            controls.moveRight(speed);
        }
        if(move.left) {
            controls.moveRight(-speed);
        }
        if(move.up) {
            camera.position.y += speed;
        }
        if(move.down) {
            camera.position.y -= speed;
        }
    }
}

export { CameraController }