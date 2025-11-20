import * as THREE from 'three';

export class Block {
    constructor(x, y, z, type = 'dirt') {
        this.type = type;
        this.mesh = this.buildBlock();
        this.mesh.position.set(x, y, z);

        // Tag for collision detection
        this.mesh.userData.entity = this;
    }

    buildBlock() {
        // 1x1x1 Cube
        const geometry = new THREE.BoxGeometry(1, 1, 1);

        let color = 0x8B4513; // SaddleBrown (Dirt)
        if (this.type === 'stone') color = 0x808080;
        if (this.type === 'wood') color = 0xA0522D;

        const material = new THREE.MeshStandardMaterial({
            map: this.createFeltTexture(color),
            roughness: 0.9,
            metalness: 0.1
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        return mesh;
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

    update(delta) {
        // Static block, no update logic needed yet
    }
}
