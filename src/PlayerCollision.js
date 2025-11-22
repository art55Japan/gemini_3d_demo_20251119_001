import * as THREE from 'three';

export class PlayerCollision {
    constructor(player) {
        this.player = player;
        this.raycaster = new THREE.Raycaster();
        this.downVector = new THREE.Vector3(0, -1, 0);
    }

    checkCollisions(entities, physics) {
        if (!entities) return;

        // Polymorphic collision handling - No if-statements for types!
        for (const entity of entities) {
            if (entity.isAlive && entity.isAlive()) {
                entity.handleCollision(this.player, physics);
            }
        }
    }

    getGroundHeight(collidables) {
        let groundHeight = 0;
        if (collidables && collidables.length > 0) {
            const rayOrigin = this.player.position.clone();
            rayOrigin.y += 1.0;

            this.raycaster.set(rayOrigin, this.downVector);

            const intersects = this.raycaster.intersectObjects(collidables, true);

            if (intersects.length > 0) {
                const hit = intersects[0];
                groundHeight = hit.point.y;
            }
        }
        return groundHeight;
    }
}
