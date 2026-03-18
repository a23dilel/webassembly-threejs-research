import * as THREE from 'three';

class Particles {
    static COMPONENTS_PER_PARTICLE = 3;

    constructor({ type = 'cubes', count = 100, posBounds = 50, size = 0.5, color = 0x00ff00, speed = 5, wireframe = false } = {} ) {
        this.type = type;
        this.count = count;
        this.posBounds = posBounds;
        this.size = size;
        this.color = color;
        this.speed = speed;
        this.wireframe = wireframe;

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
        const {type, positionArray, size, color, count, wireframe} = this;

        if (type == 'points') {
            const geometry = new THREE.BufferGeometry();
            this.posBufferAttr = new THREE.BufferAttribute(positionArray, 3);
            geometry.setAttribute('position', this.posBufferAttr);
    
            const material = new THREE.PointsMaterial({ size, color, sizeAttenuation: true});
            this.mesh = new THREE.Points(geometry, material);

        } else if (type == 'cubes') {
            const boxGeometry = new THREE.BoxGeometry(size, size, size);
            const material = new THREE.MeshBasicMaterial({ color, wireframe});
            
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

    disposeGeometry() {
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
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