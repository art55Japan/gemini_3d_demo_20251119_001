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
            // Check Height first (optimization)
            // For blocks, we want to collide if we are somewhat within the vertical range
            // But we also want to be able to jump on top.
            // The previous logic was: if (player.y > obstacleHeight) continue;
            // This allows standing on top, but doesn't handle "hitting the head" or "side collision" perfectly if we are jumping.
            // For now, let's stick to the "can stand on top" logic but refine the side collision.

            if (entity.constructor.name === 'Block') {
                // AABB Collision for Blocks
                const blockPos = entity.mesh.position;
                const halfSize = 0.5;
                const topY = blockPos.y + 0.5;

                // If we are clearly above the block, we don't collide with sides (we might land on it, handled by getGroundHeight)
                // Use a small buffer to prevent snagging when walking on edge
                if (this.player.position.y >= topY - 0.1) continue;

                // If we are too far below (e.g. jumping and hitting head), we might want to handle that too, 
                // but for now let's focus on side collision (walking into it).
                // Assuming blocks are 1x1x1

                // Find closest point on AABB to circle center
                const closestX = Math.max(blockPos.x - halfSize, Math.min(this.player.position.x, blockPos.x + halfSize));
                const closestZ = Math.max(blockPos.z - halfSize, Math.min(this.player.position.z, blockPos.z + halfSize));

                const dx = this.player.position.x - closestX;
                const dz = this.player.position.z - closestZ;
                const distanceSq = dx * dx + dz * dz;

                if (distanceSq < playerRadius * playerRadius && distanceSq > 0) {
                    // Collision!
                    const distance = Math.sqrt(distanceSq);
                    const overlap = playerRadius - distance;

                    // Normalize vector
                    const nx = dx / distance;
                    const nz = dz / distance;

                    // Push out
                    this.player.position.x += nx * overlap;
                    this.player.position.z += nz * overlap;
                } else if (distanceSq === 0) {
                    // Center is inside the block (rare but possible)
                    // Push out to nearest edge
                    const distToMinX = Math.abs(this.player.position.x - (blockPos.x - halfSize));
                    const distToMaxX = Math.abs(this.player.position.x - (blockPos.x + halfSize));
                    const distToMinZ = Math.abs(this.player.position.z - (blockPos.z - halfSize));
                    const distToMaxZ = Math.abs(this.player.position.z - (blockPos.z + halfSize));

                    const min = Math.min(distToMinX, distToMaxX, distToMinZ, distToMaxZ);

                    if (min === distToMinX) this.player.position.x -= (playerRadius + 0.01);
                    else if (min === distToMaxX) this.player.position.x += (playerRadius + 0.01);
                    else if (min === distToMinZ) this.player.position.z -= (playerRadius + 0.01);
                    else this.player.position.z += (playerRadius + 0.01);
                }

            } else {
                // Cylinder Collision for others (Trees, Rocks)
                let obstacleRadius = 0;
                let obstacleHeight = 0;

                if (entity.constructor.name === 'Tree') {
                    obstacleRadius = 0.3;
                    obstacleHeight = entity.mesh.position.y + 10.0;
                } else if (entity.constructor.name === 'Rock') {
                    const scale = entity.scale || 1.0;
                    obstacleRadius = 0.6 * scale;
                    obstacleHeight = entity.mesh.position.y + 0.7 * scale;
                } else {
                    continue;
                }

                if (this.player.position.y > obstacleHeight) continue;

                const dx = this.player.position.x - entity.mesh.position.x;
                const dz = this.player.position.z - entity.mesh.position.z;
                const distance = Math.sqrt(dx * dx + dz * dz);
                const minDistance = playerRadius + obstacleRadius;

                if (distance < minDistance) {
                    const angle = Math.atan2(dz, dx);
                    const pushX = Math.cos(angle) * minDistance;
                    const pushZ = Math.sin(angle) * minDistance;

                    this.player.position.x = entity.mesh.position.x + pushX;
                    this.player.position.z = entity.mesh.position.z + pushZ;
                }
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
