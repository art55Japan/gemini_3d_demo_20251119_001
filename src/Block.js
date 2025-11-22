import * as THREE from 'three';
import { Entity } from './Entity.js';

export class Block extends Entity {
    constructor(x, y, z, type) {
        super();
        this.type = 'Block';
        this.blockType = type;
        this.mesh = this.createMesh(x, y, z, type);
        this.position = new THREE.Vector3(x, y, z); // Use setter for sync

        // Store reference for raycasting
        this.mesh.userData.entity = this;
    }

    handleCollision(player, physics) {
        const playerRadius = 0.4;
        const blockPos = this.mesh.position;
        const halfSize = 0.5;
        const topY = blockPos.y + 0.5;

        if (player.position.y >= topY - 0.1) return;

        const closestX = Math.max(blockPos.x - halfSize, Math.min(player.position.x, blockPos.x + halfSize));
        const closestZ = Math.max(blockPos.z - halfSize, Math.min(player.position.z, blockPos.z + halfSize));

        const dx = player.position.x - closestX;
        const dz = player.position.z - closestZ;
        const distanceSq = dx * dx + dz * dz;

        if (distanceSq < playerRadius * playerRadius && distanceSq > 0) {
            const distance = Math.sqrt(distanceSq);
            const overlap = playerRadius - distance;

            const nx = dx / distance;
            const nz = dz / distance;

            player.position.x += nx * overlap;
            player.position.z += nz * overlap;
        } else if (distanceSq === 0) {
            // Handle exact overlap (rare but possible)
            const distToMinX = Math.abs(player.position.x - (blockPos.x - halfSize));
            const distToMaxX = Math.abs(player.position.x - (blockPos.x + halfSize));
            const distToMinZ = Math.abs(player.position.z - (blockPos.z - halfSize));
            const distToMaxZ = Math.abs(player.position.z - (blockPos.z + halfSize));

            const min = Math.min(distToMinX, distToMaxX, distToMinZ, distToMaxZ);

            if (min === distToMinX) player.position.x -= (playerRadius + 0.01);
            else if (min === distToMaxX) player.position.x += (playerRadius + 0.01);
            else if (min === distToMinZ) player.position.z -= (playerRadius + 0.01);
            else player.position.z += (playerRadius + 0.01);
        }
    }

    createFeltTexture(colorHex) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // Base color
        const color = new THREE.Color(colorHex);
        ctx.fillStyle = `rgb(${Math.floor(color.r * 255)}, ${Math.floor(color.g * 255)}, ${Math.floor(color.b * 255)})`;
        ctx.fillRect(0, 0, 256, 256);

        // Noise for felt look
        for (let i = 0; i < 5000; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const opacity = Math.random() * 0.1 + 0.05;
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.fillRect(x, y, 2, 2);
        }

        for (let i = 0; i < 5000; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const opacity = Math.random() * 0.1 + 0.05;
            ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
            ctx.fillRect(x, y, 2, 2);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }

    createMesh(x, y, z, type) {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        let colorHex = '#8B4513'; // Default dirt

        if (type === 'stone') colorHex = '#808080';
        if (type === 'stone_dark') colorHex = '#555555';
        if (type === 'wood') colorHex = '#A0522D';
        if (type === 'leaves') colorHex = '#228B22';

        const texture = this.createFeltTexture(colorHex);
        const material = new THREE.MeshStandardMaterial({
            map: texture,
            bumpMap: texture,
            bumpScale: 0.05,
            roughness: 0.9
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        return mesh;
    }
}
