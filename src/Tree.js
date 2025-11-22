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

        if (player.position.y > obstacleHeight) return;

        const dx = player.position.x - this.mesh.position.x;
        const dz = player.position.z - this.mesh.position.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        const minDistance = playerRadius + obstacleRadius;

        if (distance < minDistance) {
            const angle = Math.atan2(dz, dx);
            const pushX = Math.cos(angle) * minDistance;
            const pushZ = Math.sin(angle) * minDistance;

            player.position.x = this.mesh.position.x + pushX;
            player.position.z = this.mesh.position.z + pushZ;
        }
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
}
