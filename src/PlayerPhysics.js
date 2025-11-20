import * as THREE from 'three';

export class PlayerPhysics {
    constructor(player) {
        this.player = player;
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.knockbackVelocity = new THREE.Vector3(0, 0, 0);
        this.onGround = true;
        this.gravity = -20.0;
        this.jumpStrength = 8.0;
        this.speed = 10.0;
    }

    reset() {
        this.velocity.set(0, 0, 0);
        this.knockbackVelocity.set(0, 0, 0);
        this.onGround = true;
    }

    update(delta, input) {
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
                moveVector.multiplyScalar(this.speed * delta);
                this.player.position.add(moveVector);
            }
        }

        // Apply Knockback Velocity
        this.player.position.x += this.knockbackVelocity.x * delta;
        this.player.position.z += this.knockbackVelocity.z * delta;

        // Friction for knockback
        this.knockbackVelocity.multiplyScalar(0.9);
        if (this.knockbackVelocity.length() < 0.1) {
            this.knockbackVelocity.set(0, 0, 0);
        }

        // Jump
        if (this.onGround && input.jump) {
            this.velocity.y = this.jumpStrength;
            this.onGround = false;
            if (this.player.audioManager) this.player.audioManager.playJump();
        }

        // Gravity
        this.velocity.y += this.gravity * delta;
        this.player.position.y += this.velocity.y * delta;
    }

    applyKnockback(direction, strength) {
        this.knockbackVelocity.x = direction.x * strength;
        this.knockbackVelocity.z = direction.z * strength;
        this.velocity.y = 5.0; // Small hop
        this.onGround = false;
    }
}
