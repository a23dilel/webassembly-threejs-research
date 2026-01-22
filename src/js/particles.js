import * as THREE from 'three';

class Particles {
    static COMPONENTS_PER_PARTICLE = 3;

    constructor({ particleCount = 100, pointSize = 0.5, pointColor = 0x00ff00, positionBounds = 50, velocitySpeed = 5 } = {} ) {
        this.particleCount = particleCount;
        this.pointSize = pointSize;
        this.pointColor = pointColor;
        this.positionBounds = positionBounds;
        this.velocitySpeed = velocitySpeed;

        this.arrayLength = this.particleCount * Particles.COMPONENTS_PER_PARTICLE;
        this.positionArray = new Float32Array(this.arrayLength);
        this.velocityArray = new Float32Array(this.arrayLength);
        this.boxBounds = this.positionBounds / 2;
        
        this.init();
    }
      
    init() {
        const {positionArray, velocityArray, arrayLength, positionBounds, velocitySpeed, pointSize, pointColor} = this;

        // Set a random number in each position and velocity
        for (let i = 0; i < arrayLength; i++) {
            // Range: -0.5, +0.5
            const posRange = (Math.random() - 0.5); 
            const velRange = (Math.random() - 0.5);
                
            positionArray[i] = posRange * positionBounds;
            velocityArray[i] = velRange * velocitySpeed;
        }

        this.geometry = new THREE.BufferGeometry();
        this.geometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3));

        const material = new THREE.PointsMaterial({ size: pointSize, color: pointColor });
        this.mesh = new THREE.Points(this.geometry, material);
    }

    update(deltaTime) {
        const {particleCount, positionArray, velocityArray} = this;
        const bounds = this.boxBounds;

        for (let i = 0; i < particleCount; i++) {
            const index = i * Particles.COMPONENTS_PER_PARTICLE;

            // Update each particle's xyz at the same time 
            positionArray[index] += velocityArray[index] * deltaTime; // x
            positionArray[index + 1] += velocityArray[index + 1] * deltaTime; // y
            positionArray[index + 2] += velocityArray[index + 2] * deltaTime; // z

            // Check particle's collision xyz
            for (let j = 0; j < Particles.COMPONENTS_PER_PARTICLE; j++) {
                const position = positionArray[index + j];

                // if particle's xyz hit the box border, then change it directions
                if (position < -bounds || position > bounds) {
                    positionArray[index + j] = Math.max(-bounds, Math.min(bounds, position))
                    velocityArray[index + j] *= -0.8;
                }
            }
        }
        this.geometry.attributes.position.needsUpdate = true;
    }
}

export { Particles }