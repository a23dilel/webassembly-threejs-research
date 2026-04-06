#include <emscripten/bind.h> 
#include <algorithm>
#include <cstdint>

void updateParticlePhysics(uint32_t count, uint32_t maxComponents, uint32_t positionOffset, uint32_t velocityOffset, float speed, float boxBounds, float deltaTime) {
    float* positionArray = (float*)(uintptr_t)positionOffset;
    float* velocityArray = (float*)(uintptr_t)velocityOffset;
    
    // Loop through each particle
    for (uint32_t particle = 0; particle < count; particle++) {
        const uint32_t particleIndex = particle * maxComponents;

        // Loop through x, y, z from particle
        for (uint32_t component = 0; component < maxComponents; component++) {
            // Get each x, y and z
            const uint32_t componentIndex = particleIndex + component;

            // Update each x, y and z
            const float position = positionArray[componentIndex] + (velocityArray[componentIndex] * speed) * deltaTime;
            positionArray[componentIndex] = position;

            // If particle's x, y or z hits box border, then reverse direction
            if (position <= -boxBounds || position >= boxBounds) {
                const float upperClamped = std::min(boxBounds, position);
                const float lowerClamped = std::max(-boxBounds, upperClamped);
                
                const float reverseDirection = -1.0f;
                positionArray[componentIndex] = lowerClamped;
                velocityArray[componentIndex] *= reverseDirection;
            }
        }
    }
}

bool intersectsBox(float aX, float aY, float aZ, float bX, float bY, float bZ, float size) {
    const float halfSize = size / 2.0f;

    // If there is no overlap between a and b, return false
    if (aX + halfSize < bX - halfSize || aX - halfSize > bX + halfSize) { return false; };
    if (aY + halfSize < bY - halfSize || aY - halfSize > bY + halfSize) { return false; };
    if (aZ + halfSize < bZ - halfSize || aZ - halfSize > bZ + halfSize) { return false; };

    // If there is overlap between a and b, return true
    return true;
}

void updateCubeParticleCollision(uint32_t positionOffset, uint32_t velocityOffset, float size, uint32_t count, uint32_t maxComponents, float pushApart) {
    float* positionArray = (float*)(uintptr_t)positionOffset;
    float* velocityArray = (float*)(uintptr_t)velocityOffset;

    const uint32_t positionArrayLength = count * maxComponents;
        
    // Loop through all particles A
    for (uint32_t particleA = 0; particleA < positionArrayLength; particleA += maxComponents) {
        const uint32_t nextParticle = maxComponents;

        // Loop through all particles after particles A
        for(uint32_t particleB = particleA + nextParticle; particleB < positionArrayLength; particleB += maxComponents) {
            const float aX = positionArray[particleA + 0];
            const float aY = positionArray[particleA + 1];
            const float aZ = positionArray[particleA + 2];

            const float bX = positionArray[particleB + 0];
            const float bY = positionArray[particleB + 1];
            const float bZ = positionArray[particleB + 2];

            // If cube particle hits another particle cube, then reverse direction depending on which componets hits
            if(intersectsBox(aX, aY, aZ, bX, bY, bZ, size)) {
                const uint32_t particles[2] = {particleA, particleB};
                const uint32_t particleLength = sizeof(particles) / sizeof(particles[0]);

                for(uint32_t particle = 0; particle < particleLength; particle++) {
                    for (uint32_t component = 0; component < maxComponents; component++) {
                        // Get each particle's x, y and z 
                        const uint32_t componentIndex =  particles[particle] + component;
                        
                        // Make cube particles bounce away from each other
                        // Reverse the cube particle's x, y, z velocity
                        const float reverseDirection = -1.0f;
                        const float particleVel = velocityArray[componentIndex] * reverseDirection;
                        velocityArray[componentIndex] = particleVel;

                        // Prevent two cube particles from sticking together (overlapping)
                        // Move the cube particle along its new velocity (x, y, z)
                        positionArray[componentIndex] += particleVel * pushApart;
                    }
                } 
            }
        }
    }
}

EMSCRIPTEN_BINDINGS(my_module) { 
    emscripten::function("updateParticlePhysics", &updateParticlePhysics);
    emscripten::function("updateCubeParticleCollision", &updateCubeParticleCollision); 
} 