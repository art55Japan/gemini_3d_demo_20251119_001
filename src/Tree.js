import * as THREE from 'three';

export class Tree {
    constructor(x, z) {
        this.mesh = new THREE.Group();
        this.mesh.position.set(x, 0, z);

        // Textures
        const trunkTex = this.createFeltTexture('#8B4513'); // Brown
        const leavesTex = this.createFeltTexture('#228B22'); // Forest Green

        // Materials
        const trunkMat = new THREE.MeshStandardMaterial({
            map: trunkTex,
            bumpMap: trunkTex,
            bumpScale: 0.02,
            roughness: 0.9
        });

        const leavesMat = new THREE.MeshStandardMaterial({
            map: leavesTex,
            bumpMap: leavesTex,
            bumpScale: 0.05,
            roughness: 0.9
        });

        // Trunk
        const trunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 1.5, 8);
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 0.75;
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        this.mesh.add(trunk);

        // Leaves (3 cones)
        const coneGeo = new THREE.ConeGeometry(1.2, 1.5, 8);

        const bottomCone = new THREE.Mesh(coneGeo, leavesMat);
        bottomCone.position.y = 1.5;
        bottomCone.castShadow = true;
        this.mesh.add(bottomCone);

        const middleCone = new THREE.Mesh(coneGeo, leavesMat);
        middleCone.position.y = 2.2;
        middleCone.scale.set(0.8, 0.8, 0.8);
        middleCone.castShadow = true;
        this.mesh.add(middleCone);

        const topCone = new THREE.Mesh(coneGeo, leavesMat);
        topCone.position.y = 2.8;
        topCone.scale.set(0.6, 0.6, 0.6);
        topCone.castShadow = true;
        this.mesh.add(topCone);
    }

    createFeltTexture(colorHex) {
        const canvas = document.createElement('canvas');
        canvas.width = 256; // Smaller texture for props
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // Base color
        ctx.fillStyle = colorHex;
        ctx.fillRect(0, 0, 256, 256);

        // Noise
        for (let i = 0; i < 10000; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const opacity = Math.random() * 0.1 + 0.05;
            ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
            ctx.fillRect(x, y, 2, 2);

            const x2 = Math.random() * 256;
            const y2 = Math.random() * 256;
            const opacity2 = Math.random() * 0.1 + 0.05;
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity2})`;
            ctx.fillRect(x2, y2, 2, 2);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }
}
