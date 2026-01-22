import * as THREE from 'three';

class CameraController {
    constructor({ fov = 75, aspect = 1920/1080, near = 0.1, far = 1000, speed = 10} = {} ) {
        this.fov = fov;
        this.aspect = aspect;
        this.near = near;
        this.far = far;
        this.speed = speed;

        this.camera = new THREE.PerspectiveCamera(this.fov, this.aspect, this.near, this.far);
    }
}

export { CameraController }