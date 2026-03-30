import * as THREE from 'three';

class Particles {
    static #COMPONENTS = 3;

    constructor({ type = 'cubes', count = 100, spread = 50, speed = 5, size = 0.5, color = 0x00ff00, wireframe = false, isBounceable = true } = {}) {
        this.#createSetup({type, count, spread, speed, size, color, wireframe, isBounceable});
    }

    #createSetup({type, count, spread, speed, pushApart, size, color, wireframe, isBounceable}) {
        this.type = type;
        this.count = count;   
        this.speed = speed;
        this.pushApart = pushApart;
        this.size = size;
        this.isBounceable = isBounceable;
        
        const geometry = this.#createGeometry({type, size, count, spread});
        const material = this.#createMaterial({type, size, color, wireframe});
        this.mesh = this.#createMesh({type, size, count, geometry, material, isBounceable} );
    }

    #createGeometry({type, size, count, spread} = {}) {
        const particlesIndexLength = count * Particles.#COMPONENTS;
        const positionArray = new Float32Array(particlesIndexLength);
        const velocityArray = new Float32Array(particlesIndexLength);
        
        this.boxBounds = spread / 2; // Half the spread. Example: if spread is 10, then box in range is -5 and 5
        for (let i = 0; i < positionArray.length; i++) {
            positionArray[i] = this.#randomRange(-this.boxBounds, this.boxBounds); // Random position in range min and max
        }

        for (let i = 0; i < velocityArray.length; i++) {
            velocityArray[i] = this.#randomRange(-1, 1); // Random velocity in range min and max
        }

        this.positionArray = positionArray;
        this.velocityArray = velocityArray;

        if (type == 'points') {
            const bufferGeometry = new THREE.BufferGeometry();
            bufferGeometry.setAttribute('position', new THREE.BufferAttribute(positionArray, Particles.#COMPONENTS));
            return bufferGeometry;
        } else if (type == 'cubes') {            
            return new THREE.BoxGeometry(size, size, size);
        }  
    }

    #createMaterial({type, size, color, wireframe} = {}) {
        if (type == 'points') {
            return new THREE.PointsMaterial({ size, color, sizeAttenuation: true });
        } else if (type == 'cubes') {                
            return new THREE.MeshNormalMaterial({wireframe});
        } 
    }

    #createMesh({type, size, count, geometry, material, isBounceable} = {}) {
        if (type == 'points') {
            return new THREE.Points(geometry, material);
        } else if (type == 'cubes') {
            const instancedMesh = new THREE.InstancedMesh(geometry, material, count);
            this.hitBoxes = [];

            // Set each cube particle's xyz
            for(let particle = 0; particle < count; particle++) {
                this.#updateCube(particle, size, this.positionArray, instancedMesh, isBounceable);
            }

            let attempts = 0;
            const maxAttempts = 1000;
            // Check if any cube particles are inside another cube. If so, then move them to a different position
            if(isBounceable) {
                for(let firstHitBox = 0; firstHitBox < this.hitBoxes.length; firstHitBox++) {
                    const nextHitBox = 1;
                    for(let secondHitBox = firstHitBox + nextHitBox; secondHitBox < this.hitBoxes.length; secondHitBox++) {
                        // If a cube particle collides with another, move the second cube to a random position until it no longer overlaps
                        while (this.#intersectsBox(this.hitBoxes[firstHitBox], this.hitBoxes[secondHitBox]) && attempts < maxAttempts) {
                            const secondHitBoxIndex = secondHitBox * Particles.#COMPONENTS;
                            
                            const secondCubePosX = this.positionArray[secondHitBoxIndex + 0] = this.#randomRange(-this.boxBounds, this.boxBounds);
                            const secondCubePosY = this.positionArray[secondHitBoxIndex + 1] = this.#randomRange(-this.boxBounds, this.boxBounds);
                            const secondCubePosZ = this.positionArray[secondHitBoxIndex + 2] = this.#randomRange(-this.boxBounds, this.boxBounds);
                            const secondCubePos = new THREE.Vector3(secondCubePosX, secondCubePosY, secondCubePosZ);
                            
                            // Update hitbox center and size after collision
                            const box = this.hitBoxes[secondHitBox];
                            box.setFromCenterAndSize(secondCubePos, new THREE.Vector3(size, size, size));
                            this.hitBoxes[secondHitBox] = box;
                            
                            // Update cube particle's xyz after collision
                            const cubeMatrix4 = new THREE.Matrix4();
                            cubeMatrix4.makeTranslation(secondCubePos);
                            instancedMesh.setMatrixAt(secondHitBox, cubeMatrix4);
                            
                            attempts++
                        }
                    }
                }
            }
            return instancedMesh;
        }
    }

    #intersectsBox(a, b) {
        // If there is no overlap between a and b, return false
        if (a.max.x < b.min.x || a.min.x > b.max.x) return false;
        if (a.max.y < b.min.y || a.min.y > b.max.y) return false;
        if (a.max.z < b.min.z || a.min.z > b.max.z) return false;

        // If there is overlap between a and b, return true
        return true;
    }

    #randomRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    updateSetup({type, count, spread, speed, pushApart, size, color, wireframe, isBounceable} = {}) {
        if(this.mesh) {
            this.#disposeMesh();
        }

        this.#createSetup({type, count, spread, speed, pushApart, size, color, wireframe, isBounceable})
    }

    #disposeMesh() {
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
    }

    getGeometry() {
        return this.mesh;
    }

    #updateCube(particle, size, positionArray, mesh, isBounceable) {
        const particleIndex = particle * Particles.#COMPONENTS;
        
        // Get cube particle's xyz
        const x = positionArray[particleIndex + 0];
        const y = positionArray[particleIndex + 1];
        const z = positionArray[particleIndex + 2];
        const position = new THREE.Vector3(x, y, z);

        // Set hitBox's xyz
        if(isBounceable) {
            const box = new THREE.Box3();
            box.setFromCenterAndSize(position, new THREE.Vector3(size, size, size));
            this.hitBoxes[particle] = box;
        }

        // Set cube particle's xyz
        const matrix4 = new THREE.Matrix4();
        matrix4.makeTranslation(position);
        mesh.setMatrixAt(particle, matrix4);
    }

    update(deltaTime) {
        const {type, count, speed, pushApart, size, boxBounds, positionArray, velocityArray, mesh, hitBoxes, isBounceable} = this;
        
        // Loop through each particle
        for (let particle = 0; particle < count; particle++) {
            const particleIndex = particle * Particles.#COMPONENTS;

            // Loop through x, y, z from particle
            for (let component = 0; component < Particles.#COMPONENTS; component++) {
                // Get each x, y and z
                const componentIndex = particleIndex + component;

                // Update each x, y and z
                const position = positionArray[componentIndex] += (velocityArray[componentIndex] * speed) * deltaTime;

                // If particle's x, y or z hits box border, then reverse direction
                if (position <= -boxBounds || position >= boxBounds) {
                    const upperClamped = Math.min(boxBounds, position);
                    const lowerClamped = Math.max(-boxBounds, upperClamped);
                    
                    const reverseDirection = -1;
                    positionArray[componentIndex] = lowerClamped;
                    velocityArray[componentIndex] *= reverseDirection;
                }
            }
        }
        
        if (type == 'cubes') {
            for (let particle = 0; particle < count; particle++) { 
                this.#updateCube(particle, size, positionArray, mesh, isBounceable);
            }

            if (isBounceable) {
                for(let firstHitBox = 0; firstHitBox < hitBoxes.length; firstHitBox++) {
                    const nextHitBox = 1;
                    for(let secondHitBox = firstHitBox + nextHitBox; secondHitBox < hitBoxes.length; secondHitBox++) {
                        
                        // If cube particle hits another particle cube, then reverse direction
                        if(this.#intersectsBox(hitBoxes[firstHitBox], hitBoxes[secondHitBox])) {
                            const firstCubeHitBoxIndex = firstHitBox * Particles.#COMPONENTS;
                            const secondCubeHitBoxIndex = secondHitBox * Particles.#COMPONENTS;
                            const cubeHitBoxes = [firstCubeHitBoxIndex, secondCubeHitBoxIndex];

                            for(let cubeHitBox = 0; cubeHitBox < cubeHitBoxes.length; cubeHitBox++) {
                                for (let component = 0; component < Particles.#COMPONENTS; component++) {
                                    // Get hitBox's x, y and z 
                                    const componentIndex = cubeHitBoxes[cubeHitBox] + component;
                                    
                                    // Make cube particles bounce away from each other
                                    // Reverse the cube particle's x, y, z velocity
                                    const reverseDirection = -1;
                                    const cubeVel = velocityArray[componentIndex] *= reverseDirection;
    
                                    // Prevent two cube particles from sticking together (overlapping)
                                    // Move the cube particle along its new velocity (x, y, z)
                                    positionArray[componentIndex] += cubeVel * pushApart;
                                }
                            }
                        }
                    }
                }
            }

            mesh.instanceMatrix.needsUpdate = true;
        } else if (type == 'points') {
            mesh.geometry.attributes.position.needsUpdate = true;
        }
    }
}

export { Particles }