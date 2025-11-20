import * as THREE from 'three';
import { PlayerMesh } from './PlayerMesh.js';

export class Player {
    constructor(scene, audioManager) {
        this.scene = scene;
        this.audioManager = audioManager;
        this.position = new THREE.Vector3(0, 0, 0);
        this.speed = 10.0; // Doubled from 5.0
        this.rotationSpeed = 10.0;

        this.mesh = this.buildCharacter();
        this.mesh.position.copy(this.position);
        this.mesh.rotation.y = 0; // Face Forward (-Z) by default
        this.scene.add(this.mesh);

        // Physics
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.knockbackVelocity = new THREE.Vector3(0, 0, 0);
        this.onGround = true;
        this.gravity = -20.0;
        this.jumpStrength = 8.0;

        // Collision
        this.raycaster = new THREE.Raycaster();
        this.downVector = new THREE.Vector3(0, -1, 0);

        // Combat
        this.sword = this.mesh.getObjectByName('sword');
        this.isAttacking = false;
        this.attackTimer = 0;
        this.attackDuration = 0.4;
        this.baseSwordRotation = Math.PI / 4;
    }

    buildCharacter() {
        return new PlayerMesh().create();
    }

    update(delta, input, time, collidables, entities) {
        // Emergency Reset
        if (input.reset) {
            this.position.set(0, 0.5, 0);
            this.velocity.set(0, 0, 0);
            this.knockbackVelocity.set(0, 0, 0);
            this.onGround = true;
            this.mesh.rotation.y = 0;
            console.log("Player Reset");
        }

        // Rotation (Manual)
        const rotationSpeed = 3.0; // Adjust speed as needed
        if (input.rotateLeft) {
            this.mesh.rotation.y += rotationSpeed * delta;
        }
        if (input.rotateRight) {
            this.mesh.rotation.y -= rotationSpeed * delta;
        }

        // Movement (Character Relative)
        const moveX = input.x; // Strafe (A/D)
        const moveZ = input.z; // Forward/Back (W/S)

        // Apply Input Movement
        if (moveX !== 0 || moveZ !== 0) {
            // Calculate Movement Vector (Character Relative)
            // Forward is -Z (0, 0, -1)
            const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.mesh.rotation.y);
            // Right is +X (1, 0, 0)
            const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.mesh.rotation.y);

            const moveVector = new THREE.Vector3();

            // Strafing Logic (Standardized)
            // W (moveZ = -1) -> Should move Forward. forward * -(-1) = forward. Correct.
            // S (moveZ = 1) -> Should move Backward. forward * -(1) = backward. Correct.
            moveVector.addScaledVector(forward, -moveZ);

            // A (moveX = -1) -> Should move Left. right * (-1) = left. Correct.
            // D (moveX = 1) -> Should move Right. right * (1) = right. Correct.
            moveVector.addScaledVector(right, moveX);

            if (moveVector.length() > 0) {
                moveVector.normalize();
                moveVector.multiplyScalar(this.speed * delta);
                this.position.add(moveVector);
            }
        }

        // Apply Knockback Velocity (Always apply)
        this.position.x += this.knockbackVelocity.x * delta;
        this.position.z += this.knockbackVelocity.z * delta;

        // Friction for knockback
        this.knockbackVelocity.multiplyScalar(0.9);
        if (this.knockbackVelocity.length() < 0.1) {
            this.knockbackVelocity.set(0, 0, 0);
        }

        // Raycast for Ground/Platform Detection (Always check)
        let groundHeight = 0;
        if (collidables && collidables.length > 0) {
            // Cast ray from slightly above player position downwards
            const rayOrigin = this.position.clone();
            rayOrigin.y += 1.0; // Start ray 1 unit above

            this.raycaster.set(rayOrigin, this.downVector);

            const intersects = this.raycaster.intersectObjects(collidables, true); // Recursive check

            if (intersects.length > 0) {
                const hit = intersects[0];
                groundHeight = hit.point.y;
            }
        }

        // Jump & Gravity (Always check)
        if (input.jump) {
            console.log(`Jump Input Detected. OnGround: ${this.onGround}`);
        }
        if (this.onGround && input.jump) {
            this.velocity.y = this.jumpStrength;
            this.onGround = false;
            if (this.audioManager) this.audioManager.playJump();
            console.log("JUMPED!");
        }

        // Apply Gravity
        this.velocity.y += this.gravity * delta;
        this.position.y += this.velocity.y * delta;

        // Ground/Platform Collision
        if (this.position.y <= groundHeight) {
            this.position.y = groundHeight;
            this.velocity.y = 0;
            this.onGround = true;
        } else {
            if (this.position.y > groundHeight + 0.1 && this.velocity.y < 0) {
                this.onGround = false;
            }
        }

        this.mesh.position.copy(this.position);

        // Combat Update (Always check)
        this.updateAttack(delta, input, entities);

        // Enemy Collision (Knockback) (Always check)
        this.checkEnemyCollision(entities);

        // Environment Collision (Trees, Rocks) (Always check)
        this.checkEnvironmentCollision(entities);
    }

    checkEnvironmentCollision(entities) {
        if (!entities) return;

        const playerRadius = 0.4; // Player body radius

        for (const entity of entities) {
            let obstacleRadius = 0;
            let obstacleHeight = 0;

            if (entity.constructor.name === 'Tree') {
                obstacleRadius = 0.3; // Trunk radius + buffer
                obstacleHeight = 10.0; // Too high to jump over
            } else if (entity.constructor.name === 'Rock') {
                const scale = entity.scale || 1.0;
                obstacleRadius = 0.6 * scale;
                obstacleHeight = 0.7 * scale; // Allow standing on top
            } else if (entity.constructor.name === 'Block') {
                obstacleRadius = 0.5; // 1x1 cube, radius 0.5
                obstacleHeight = 0.9; // Allow standing on top
            } else {
                continue;
            }

            // Check Height
            if (this.position.y > obstacleHeight) continue; // Above the obstacle
            const dx = this.position.x - entity.mesh.position.x;
            const dz = this.position.z - entity.mesh.position.z;
            const distance = Math.sqrt(dx * dx + dz * dz);
            const minDistance = playerRadius + obstacleRadius;

            if (distance < minDistance) {
                // Collision detected
                // Push player out
                const angle = Math.atan2(dz, dx);
                const pushX = Math.cos(angle) * minDistance;
                const pushZ = Math.sin(angle) * minDistance;

                this.position.x = entity.mesh.position.x + pushX;
                this.position.z = entity.mesh.position.z + pushZ;
            }
        }
    }

    checkEnemyCollision(entities) {
        if (!entities) return;

        const collisionRange = 0.8; // Body radius + Slime radius

        for (const entity of entities) {
            if (entity.constructor.name === 'Slime' && !entity.isDead) {
                const dist = this.position.distanceTo(entity.position);
                if (dist < collisionRange) {
                    // Calculate knockback direction (away from slime)
                    const knockbackDir = this.position.clone().sub(entity.position).normalize();

                    // Apply horizontal knockback
                    const knockbackStrength = 15.0;
                    this.knockbackVelocity.x = knockbackDir.x * knockbackStrength;
                    this.knockbackVelocity.z = knockbackDir.z * knockbackStrength;

                    // Apply vertical knockback (small hop)
                    this.velocity.y = 5.0;
                    this.onGround = false;

                    if (this.audioManager) this.audioManager.playHit();
                }
            }
        }
    }

    updateAttack(delta, input, entities) {
        if (input.attack && !this.isAttacking) {
            this.isAttacking = true;
            this.attackTimer = 0;
            if (this.audioManager) this.audioManager.playAttack();
        }

        if (this.isAttacking) {
            this.attackTimer += delta;

            // Sword Animation (Swing down and up)
            // 0 to 0.5: Swing down
            // 0.5 to 1.0: Swing up
            const progress = this.attackTimer / this.attackDuration;

            if (progress < 0.5) {
                // Swing down
                this.sword.rotation.x = this.baseSwordRotation + (progress * 2) * (Math.PI / 2);
            } else {
                // Swing up
                this.sword.rotation.x = this.baseSwordRotation + (Math.PI / 2) - ((progress - 0.5) * 2) * (Math.PI / 2);
            }

            // Check Hit (only during the middle of the swing)
            if (progress > 0.2 && progress < 0.6) {
                this.checkAttackCollision(entities);
            }

            if (this.attackTimer >= this.attackDuration) {
                this.isAttacking = false;
                this.sword.rotation.x = this.baseSwordRotation;
            }
        }
    }

    checkAttackCollision(entities) {
        if (!entities) return;

        const attackRange = 2.0;
        const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.mesh.rotation.y);
        const attackPos = this.position.clone().add(forward.multiplyScalar(1.0)); // Hitbox center in front of player

        for (const entity of entities) {
            if (entity.constructor.name === 'Slime') {
                const dist = attackPos.distanceTo(entity.position);
                if (dist < attackRange) {
                    if (entity.takeDamage) {
                        entity.takeDamage();
                        if (this.audioManager) this.audioManager.playEnemyDeath();
                    }
                }
            }
        }
    }
}

