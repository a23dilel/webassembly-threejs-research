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
        this.generateParticles();
        this.createGeometry();
    }

    generateParticles() {
        const {positionArray, velocityArray, arrayLength, positionBounds, velocitySpeed} = this;

        // Set a random number in each position and velocity
        for (let i = 0; i < arrayLength; i++) {
            // Range: -0.5, +0.5
            const posRange = (Math.random() - 0.5); 
            const velRange = (Math.random() - 0.5);
                
            positionArray[i] = posRange * positionBounds;
            velocityArray[i] = velRange * velocitySpeed;
        }
    }

    createGeometry() {
        const {positionArray, pointSize, pointColor} = this;

        this.geometry = new THREE.BufferGeometry();
        this.geometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3));

        const material = new THREE.PointsMaterial({ size: pointSize, color: pointColor });
        this.mesh = new THREE.Points(this.geometry, material);
    }

    update(deltaTime) {
        const {particleCount, positionArray, velocityArray} = this;
        const bounds = this.boxBounds;

        // Loop through each particle
        for (let i = 0; i < particleCount; i++) {
            const particleIndex = i * Particles.COMPONENTS_PER_PARTICLE;

            // Loop through x, y, z from particle
            for (let j = 0; j < Particles.COMPONENTS_PER_PARTICLE; j++) {
                
                // Move particle's xyz
                positionArray[particleIndex + j] += velocityArray[particleIndex + j] * deltaTime;
                
                const particlePos = positionArray[particleIndex + j];

                // If particle's xyz hits box border, then reverse direction
                if (particlePos < -bounds || particlePos > bounds) {
                    positionArray[particleIndex + j] = Math.max(-bounds, Math.min(bounds, particlePos))
                    velocityArray[particleIndex + j] *= -1;
                }
            }
        }
        this.geometry.attributes.position.needsUpdate = true;
    }
}

export { Particles }