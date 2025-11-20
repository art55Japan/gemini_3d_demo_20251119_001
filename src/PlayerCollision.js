import * as THREE from 'three';

export class PlayerCollision {
    constructor(player) {
        this.player = player;
        this.raycaster = new THREE.Raycaster();
        this.downVector = new THREE.Vector3(0, -1, 0);
    }

    checkEnvironment(entities) {
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
            if (this.player.position.y > obstacleHeight) continue; // Above the obstacle
            const dx = this.player.position.x - entity.mesh.position.x;
            const dz = this.player.position.z - entity.mesh.position.z;
            const distance = Math.sqrt(dx * dx + dz * dz);
            const minDistance = playerRadius + obstacleRadius;

            if (distance < minDistance) {
                // Collision detected
                // Push player out
                const angle = Math.atan2(dz, dx);
                const pushX = Math.cos(angle) * minDistance;
                const pushZ = Math.sin(angle) * minDistance;

                this.player.position.x = entity.mesh.position.x + pushX;
                this.player.position.z = entity.mesh.position.z + pushZ;
            }
        }
    }

    checkEnemies(entities, physics) {
        if (!entities) return;

        const collisionRange = 0.8; // Body radius + Slime radius

        for (const entity of entities) {
            if (entity.constructor.name === 'Slime' && !entity.isDead) {
                const dist = this.player.position.distanceTo(entity.position);
                if (dist < collisionRange) {
                    // Calculate knockback direction (away from slime)
                    const knockbackDir = this.player.position.clone().sub(entity.position).normalize();

                    // Apply knockback via physics component
                    physics.applyKnockback(knockbackDir, 15.0);

                    if (this.player.audioManager) this.player.audioManager.playHit();
                }
            }
        }
    }

    getGroundHeight(collidables) {
        let groundHeight = 0;
        if (collidables && collidables.length > 0) {
            // Cast ray from slightly above player position downwards
            const rayOrigin = this.player.position.clone();
            rayOrigin.y += 1.0; // Start ray 1 unit above

            this.raycaster.set(rayOrigin, this.downVector);

            const intersects = this.raycaster.intersectObjects(collidables, true); // Recursive check

            if (intersects.length > 0) {
                const hit = intersects[0];
                groundHeight = hit.point.y;
            }
        }
        return groundHeight;
    }
}
