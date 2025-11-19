import * as THREE from 'three';

export class Rock {
    constructor(x, z, scale = 1) {
        this.mesh = new THREE.Group();
        this.mesh.position.set(x, 0, z);

        // Texture
        const rockTex = this.createFeltTexture('#808080'); // Grey

        // Material
        const rockMat = new THREE.MeshStandardMaterial({
            map: rockTex,
            bumpMap: rockTex,
            bumpScale: 0.05,
            roughness: 0.9
        });

        // Geometry (Dodecahedron for low-poly rock look)
        const rockGeo = new THREE.DodecahedronGeometry(0.5 * scale, 0);
        const rock = new THREE.Mesh(rockGeo, rockMat);

        // Random rotation for variety
        rock.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );

        // Sink slightly into ground
        rock.position.y = 0.3 * scale;

        rock.castShadow = true;
        rock.receiveShadow = true;
        this.mesh.add(rock);
    }

    createFeltTexture(colorHex) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = colorHex;
        ctx.fillRect(0, 0, 256, 256);

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
