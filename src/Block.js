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

    // handleCollision removed to rely on PlayerPhysics AABB collision via collidables array

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

        // Map type to color using object lookup instead of if-statements
        const colorMap = {
            'stone': '#808080',
            'stone_dark': '#555555',
            'wood': '#A0522D',
            'leaves': '#228B22'
        };

        const colorHex = colorMap[type] || '#8B4513'; // Default dirt

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

    // Polymorphic save methods
    isSaveable() {
        return true;
    }

    toSaveData() {
        return {
            type: 'block',
            x: this.mesh.position.x,
            y: this.mesh.position.y,
            z: this.mesh.position.z,
            blockType: this.blockType
        };
    }

    static fromSaveData(data) {
        return new Block(data.x, data.y, data.z, data.blockType);
    }
}
