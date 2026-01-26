import * as THREE from 'three';

class Particles {
    static COMPONENTS_PER_PARTICLE = 3;

    constructor({ type = 'cubes', count = 100, size = 0.5, color = 0x00ff00, posBounds = 50, speed = 5 } = {} ) {
        this.type = type;
        this.count = count;
        this.size = size;
        this.color = color;
        this.posBounds = posBounds;
        this.speed = speed;

        this.particleLength = this.count * Particles.COMPONENTS_PER_PARTICLE;
        this.positionArray = new Float32Array(this.particleLength);
        this.velocityArray = new Float32Array(this.particleLength);
        this.boxBounds = this.posBounds / 2;
        
        this.generateParticles();
    }

    generateParticles() {
        const {positionArray, velocityArray, posBounds, speed} = this;

        // Set a random number in each position and velocity
        for (let i = 0; i < positionArray.length; i++) {
            // Range: -0.5, +0.5
            const posRange = (Math.random() - 0.5); 
            const velRange = (Math.random() - 0.5);
                
            positionArray[i] = posRange * posBounds;
            velocityArray[i] = velRange * speed;
        }

        this.createGeometry();
    }

    createGeometry() {
        const {type, positionArray, size, color, count} = this;

        if (type == 'points') {
            const geometry = new THREE.BufferGeometry();
            this.posBufferAttr = new THREE.BufferAttribute(positionArray, 3);
            geometry.setAttribute('position', this.posBufferAttr);
    
            const material = new THREE.PointsMaterial({ size: size, color: color, sizeAttenuation: true});
            this.mesh = new THREE.Points(geometry, material);

        } else if (type == 'cubes') {
            const boxGeometry = new THREE.BoxGeometry(size, size, size);
            const material = new THREE.MeshBasicMaterial({ color: color });
            
            this.mesh = new THREE.InstancedMesh(boxGeometry, material, count);
            this.object3D = new THREE.Object3D();
    
            for (let i = 0; i < this.mesh.count; i++) {
                const particleIndex = i * Particles.COMPONENTS_PER_PARTICLE;
    
                this.object3D.position.fromArray(positionArray, particleIndex);
                this.object3D.updateMatrix();
                this.mesh.setMatrixAt(i, this.object3D.matrix);
            }
        }

    }

    update(deltaTime) {
        const {type, count, positionArray, velocityArray, boxBounds} = this;

        if (type == 'points') {
            this.posBufferAttr.needsUpdate = true;
        } else if (type == 'cubes') {
            this.mesh.instanceMatrix.needsUpdate = true;
        }

        // Loop through each particle
        for (let i = 0; i < count; i++) {
            const particleIndex = i * Particles.COMPONENTS_PER_PARTICLE;

            // Loop through x, y, z from particle
            for (let j = 0; j < Particles.COMPONENTS_PER_PARTICLE; j++) {
                
                // Move particle's xyz
                    positionArray[particleIndex + j] += velocityArray[particleIndex + j] * deltaTime;

                if (type == 'cubes') {
                    this.object3D.position.fromArray(positionArray, particleIndex);
                    this.object3D.updateMatrix();
                    this.mesh.setMatrixAt(i, this.object3D.matrix);
                }
                
                const particlePos = positionArray[particleIndex + j];

                // If particle's xyz hits box border, then reverse direction
                if (particlePos < -boxBounds || particlePos > boxBounds) {
                    positionArray[particleIndex + j] = Math.max(-boxBounds, Math.min(boxBounds, particlePos))
                    velocityArray[particleIndex + j] *= -1;
                }
            }
        }
    }
}

export { Particles }