import * as THREE from 'three';

export class PlayerPhysics {
    constructor(player) {
        this.player = player;
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.knockbackVelocity = new THREE.Vector3(0, 0, 0);
        this.onGround = true;
        this.gravity = -30.0;
        this.jumpStrength = 15.0;
        this.speed = 10.0;
    }

    reset() {
        this.velocity.set(0, 0, 0);
        this.knockbackVelocity.set(0, 0, 0);
        this.onGround = true;
    }

    update(delta, input, collidables) {
        this.handleMovement(delta, input);
        this.applyKnockbackPhysics(delta);
        this.applyGravityPhysics(delta);

        // Perform movement and collision resolution
        this.moveAndCollide(delta, collidables);

        this.handleJump(input);
    }

    handleMovement(delta, input) {
        // Movement (Character Relative)
        const moveX = input.x; // Strafe (A/D)
        const moveZ = input.z; // Forward/Back (W/S)

        if (moveX !== 0 || moveZ !== 0) {
            // Calculate Movement Vector (Character Relative)
            // Forward is -Z (0, 0, -1)
            const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.player.mesh.rotation.y);
            // Right is +X (1, 0, 0)
            const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.player.mesh.rotation.y);

            const moveVector = new THREE.Vector3();

            // Strafing Logic (Standardized)
            moveVector.addScaledVector(forward, -moveZ);
            moveVector.addScaledVector(right, moveX);

            if (moveVector.length() > 0) {
                moveVector.normalize();
                moveVector.multiplyScalar(this.speed); // Velocity, not position change yet
                this.velocity.x = moveVector.x;
                this.velocity.z = moveVector.z;
            } else {
                this.velocity.x = 0;
                this.velocity.z = 0;
            }
        } else {
            this.velocity.x = 0;
            this.velocity.z = 0;
        }
    }

    applyKnockbackPhysics(delta) {
        // Apply Knockback Velocity
        this.velocity.x += this.knockbackVelocity.x;
        this.velocity.z += this.knockbackVelocity.z;

        // Friction for knockback
        this.knockbackVelocity.multiplyScalar(0.9);
        if (this.knockbackVelocity.length() < 0.1) {
            this.knockbackVelocity.set(0, 0, 0);
        }
    }

    applyGravityPhysics(delta) {
        // Gravity
        this.velocity.y += this.gravity * delta;
    }

    moveAndCollide(delta, collidables) {
        const playerRadius = 0.3;
        const playerHeight = 1.0;
        const stepHeight = 0.1;

        // X Axis
        const originalVelocityX = this.velocity.x;
        this.player.position.x += this.velocity.x * delta;
        let collisionsX = this.checkCollisions(collidables, playerRadius, playerHeight);

        // Filter out floors
        collisionsX = collisionsX.filter(block => {
            const blockTop = block.position.y + 0.5;
            return this.player.position.y < blockTop - stepHeight;
        });

        if (collisionsX.length > 0) {
            // We might collide with multiple blocks. We should push out from the one that requires the most correction?
            // Or just push out from all of them sequentially.
            // Since we are moving in one direction, usually the first one we hit (closest) is the one that matters.
            // But if they are stacked/staggered, we need to be careful.
            // Simple approach: Iterate all, push out if needed. Use original direction.

            for (const block of collisionsX) {
                if (originalVelocityX > 0) {
                    // Moving Right, hit left side of block
                    const wallX = block.position.x - 0.5 - playerRadius - 0.001;
                    if (this.player.position.x > wallX) {
                        this.player.position.x = wallX;
                    }
                } else if (originalVelocityX < 0) {
                    // Moving Left, hit right side of block
                    const wallX = block.position.x + 0.5 + playerRadius + 0.001;
                    if (this.player.position.x < wallX) {
                        this.player.position.x = wallX;
                    }
                }
            }
            this.velocity.x = 0;
        }

        // Z Axis
        const originalVelocityZ = this.velocity.z;
        this.player.position.z += this.velocity.z * delta;
        let collisionsZ = this.checkCollisions(collidables, playerRadius, playerHeight);

        // Filter out floors
        collisionsZ = collisionsZ.filter(block => {
            const blockTop = block.position.y + 0.5;
            return this.player.position.y < blockTop - stepHeight;
        });

        if (collisionsZ.length > 0) {
            for (const block of collisionsZ) {
                if (originalVelocityZ > 0) {
                    // Moving Forward (Z+), hit back side of block
                    const wallZ = block.position.z - 0.5 - playerRadius - 0.001;
                    if (this.player.position.z > wallZ) {
                        this.player.position.z = wallZ;
                    }
                } else if (originalVelocityZ < 0) {
                    // Moving Backward (Z-), hit front side of block
                    const wallZ = block.position.z + 0.5 + playerRadius + 0.001;
                    if (this.player.position.z < wallZ) {
                        this.player.position.z = wallZ;
                    }
                }
            }
            this.velocity.z = 0;
        }

        // Y Axis
        const previousY = this.player.position.y;
        this.player.position.y += this.velocity.y * delta;
        let collisionsY = this.checkCollisions(collidables, playerRadius, playerHeight);

        // Sort collisions to handle stacks correctly
        if (this.velocity.y < 0) {
            // Falling: Check highest blocks first (land on top of stack)
            collisionsY.sort((a, b) => b.position.y - a.position.y);
        } else if (this.velocity.y > 0) {
            // Jumping: Check lowest blocks first (hit bottom of stack)
            collisionsY.sort((a, b) => a.position.y - b.position.y);
        }

        let landed = false;

        for (const block of collisionsY) {
            if (this.velocity.y < 0) {
                // Landing
                // Check if we were previously above the block's center
                // This handles fast falling where we might penetrate deep into the block in one frame
                if (previousY >= block.position.y) {
                    this.player.position.y = block.position.y + 0.5; // On top
                    this.velocity.y = 0;
                    this.onGround = true;
                    landed = true;
                    break;
                }
            } else if (this.velocity.y > 0) {
                // Head bump
                // Check if we were previously below the block's center
                if (previousY <= block.position.y) {
                    this.player.position.y = block.position.y - 0.5 - playerHeight * 1.7 - 0.01; // Push down slightly
                    this.velocity.y = 0;
                }
            }
        }

        if (!landed) {
            if (this.player.position.y <= 0) {
                this.player.position.y = 0;
                this.velocity.y = 0;
                this.onGround = true;
            } else {
                this.onGround = false;
            }
        }
    }

    checkCollisions(collidables, radius, height) {
        const collisions = [];
        if (!collidables) return collisions;

        const playerBox = new THREE.Box3();
        const center = this.player.position.clone();
        // Define player AABB (approximate)
        // Reduced height multiplier from 1.8 to 1.7 for better clearance
        playerBox.min.set(center.x - radius, center.y, center.z - radius);
        playerBox.max.set(center.x + radius, center.y + height * 1.7, center.z + radius);

        for (const obj of collidables) {
            const blockPos = obj.position;
            const blockBox = new THREE.Box3();
            blockBox.min.set(blockPos.x - 0.5, blockPos.y - 0.5, blockPos.z - 0.5);
            blockBox.max.set(blockPos.x + 0.5, blockPos.y + 0.5, blockPos.z + 0.5);

            if (playerBox.intersectsBox(blockBox)) {
                collisions.push(obj);
            }
        }
        return collisions;
    }

    handleJump(input) {
        // Jump
        if (this.onGround && input.jump) {
            this.velocity.y = this.jumpStrength;
            this.onGround = false;
            if (this.player.audioManager) this.player.audioManager.playJump();
        }
    }

    applyKnockback(direction, strength) {
        this.knockbackVelocity.x = direction.x * strength;
        this.knockbackVelocity.z = direction.z * strength;
        this.velocity.y = 5.0; // Small hop
        this.onGround = false;
    }
}
