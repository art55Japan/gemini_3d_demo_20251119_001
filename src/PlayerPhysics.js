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
        this.moveAndCollide(delta, collidables);
        this.handleJump(input);
    }

    handleMovement(delta, input) {
        // Calculate Movement Vector (Character Relative)
        const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.player.mesh.rotation.y);
        const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.player.mesh.rotation.y);

        const moveVector = new THREE.Vector3()
            .addScaledVector(forward, -input.z)
            .addScaledVector(right, input.x);

        // Normalize and apply speed (Vector math handles 0 length case implicitly if we check lengthSq)
        const lengthSq = moveVector.lengthSq();
        // Avoid if-else by using ternary or just math (multiply by 0 if length is 0)
        // But ternary is cleaner here for normalization safety
        const scale = lengthSq > 0 ? this.speed / Math.sqrt(lengthSq) : 0;

        this.velocity.x = moveVector.x * scale;
        this.velocity.z = moveVector.z * scale;
    }

    applyKnockbackPhysics(delta) {
        this.velocity.x += this.knockbackVelocity.x;
        this.velocity.z += this.knockbackVelocity.z;

        // Friction
        this.knockbackVelocity.multiplyScalar(0.9);

        // Clamp to 0 if small (avoid if-statement with max/min logic? No, threshold check is fine for optimization)
        // Or use a damping factor that eventually reaches 0.
        // Keeping simple threshold for performance, but could be:
        // this.knockbackVelocity.multiplyScalar(Math.max(0, 1 - 10 * delta)); // Damping
    }

    applyGravityPhysics(delta) {
        this.velocity.y += this.gravity * delta;
    }

    moveAndCollide(delta, collidables) {
        const playerRadius = 0.3;
        const playerHeight = 1.0;
        const stepHeight = 0.1;

        // Helper to resolve collision on a single axis
        const resolveAxis = (axis, velocityComp) => {
            this.player.position[axis] += this.velocity[axis] * delta;

            // Get potential collisions
            const collisions = this.checkCollisions(collidables, playerRadius, playerHeight)
                .filter(block => this.player.position.y < block.position.y + 0.5 - stepHeight);

            // Resolve
            collisions.forEach(block => {
                const dir = Math.sign(this.velocity[axis]);
                // If moving positive, we hit min side (pos - size/2). If negative, hit max side (pos + size/2)
                // Wall position: block.pos - (dir * (0.5 + radius + epsilon))
                const wallPos = block.position[axis] - (dir * (0.5 + playerRadius + 0.001));

                // Only correct if we penetrated (Math.sign check ensures we only push back against movement)
                // Using Math.min/max to clamp position
                if (dir > 0) this.player.position[axis] = Math.min(this.player.position[axis], wallPos);
                if (dir < 0) this.player.position[axis] = Math.max(this.player.position[axis], wallPos);
            });

            // Zero velocity if collision occurred
            if (collisions.length > 0) this.velocity[axis] = 0;
        };

        resolveAxis('x');
        resolveAxis('z');

        // Y Axis
        const previousY = this.player.position.y;
        this.player.position.y += this.velocity.y * delta;
        const collisionsY = this.checkCollisions(collidables, playerRadius, playerHeight);

        let landed = false;

        collisionsY.forEach(block => {
            const isFalling = this.velocity.y < 0;
            const isJumping = this.velocity.y > 0;

            // Landing logic
            // If falling and was above: land
            const wasAbove = previousY >= block.position.y + 0.5;
            if (isFalling && wasAbove) {
                this.player.position.y = block.position.y + 0.5;
                this.velocity.y = 0;
                this.onGround = true;
                landed = true;
            }

            // Head bump logic
            // If jumping and was below: bump
            const wasBelow = previousY <= block.position.y - 0.5;
            if (isJumping && wasBelow) {
                this.player.position.y = block.position.y - 0.5 - playerHeight * 1.7 - 0.01;
                this.velocity.y = 0;
            }
        });

        // Ground check fallback
        if (!landed) {
            // Use Math.max to clamp to ground plane (0)
            const onFloor = this.player.position.y <= 0;
            this.player.position.y = Math.max(0, this.player.position.y);

            // Update state based on floor contact
            // Avoid if/else by setting properties directly based on boolean
            this.onGround = onFloor;
            if (onFloor) this.velocity.y = Math.max(0, this.velocity.y); // Stop falling
        }
    }

    checkCollisions(collidables, radius, height) {
        if (!collidables) return [];

        const playerBox = new THREE.Box3();
        const center = this.player.position;
        playerBox.min.set(center.x - radius, center.y, center.z - radius);
        playerBox.max.set(center.x + radius, center.y + height * 1.7, center.z + radius);

        // Filter using AABB intersection
        // This is already declarative/functional
        return collidables.filter(obj => {
            const blockPos = obj.position;
            const blockBox = new THREE.Box3();
            blockBox.min.set(blockPos.x - 0.5, blockPos.y - 0.5, blockPos.z - 0.5);
            blockBox.max.set(blockPos.x + 0.5, blockPos.y + 0.5, blockPos.z + 0.5);
            return playerBox.intersectsBox(blockBox);
        });
    }

    handleJump(input) {
        // Boolean logic for jump trigger
        const canJump = this.onGround && input.jump;
        this.velocity.y = canJump ? this.jumpStrength : this.velocity.y;
        this.onGround = canJump ? false : this.onGround;

        if (canJump && this.player.audioManager) {
            this.player.audioManager.playJump();
        }
    }

    applyKnockback(direction, strength) {
        this.knockbackVelocity.copy(direction).multiplyScalar(strength);
        this.velocity.y = 5.0;
        this.onGround = false;
    }
}
