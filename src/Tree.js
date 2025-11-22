import * as THREE from 'three';
import { Entity } from './Entity.js';

export class Tree extends Entity {
    constructor(x, z) {
        super();
        this.type = 'Tree';
        this.mesh = this.createTree(x, z);
        this.position = new THREE.Vector3(x, 0, z); // Use setter

        // Store reference
        this.mesh.userData.entity = this;
    }

    handleCollision(player, physics) {
        const obstacleRadius = 0.3;
        const obstacleHeight = this.mesh.position.y + 10.0;
        const playerRadius = 0.4;

        // Early return for height check (acceptable for optimization)
        if (player.position.y > obstacleHeight) return;

        const dx = player.position.x - this.mesh.position.x;
        const dz = player.position.z - this.mesh.position.z;
        const distSq = dx * dx + dz * dz;
        const distance = Math.sqrt(distSq);
        const minDistance = playerRadius + obstacleRadius;

        // Calculate overlap (positive if colliding, negative/zero if not)
        const overlap = minDistance - distance;

        // Use Math.max to only apply push when overlap is positive
        const pushAmount = Math.max(0, overlap);

        // Normalize direction (handle zero distance with epsilon)
        const safeDistance = Math.max(distance, 0.001);
        const nx = dx / safeDistance;
        const nz = dz / safeDistance;

        // Apply push (will be zero if no collision)
        player.position.x += nx * pushAmount;
        player.position.z += nz * pushAmount;
    }

    createTree(x, z) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);

        // Trunk
        const trunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 2, 8);
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 1;
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        group.add(trunk);

        // Leaves (Cone)
        const leavesGeo = new THREE.ConeGeometry(1.5, 3, 8);
        const leavesMat = new THREE.MeshStandardMaterial({ color: 0x228B22 });
        const leaves = new THREE.Mesh(leavesGeo, leavesMat);
        leaves.position.y = 3;
        leaves.castShadow = true;
        leaves.receiveShadow = true;
        group.add(leaves);

        return group;
    }

    // Trees are not saved (they are part of world generation)
    isSaveable() {
        return false;
    }
}
