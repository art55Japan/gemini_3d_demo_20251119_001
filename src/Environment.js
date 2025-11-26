import * as THREE from 'three';

/**
 * Environment Class
 * Responsible for setting up the game environment (ground, lighting, sky)
 */
export class Environment {
    constructor(scene) {
        this.scene = scene;
    }

    setup() {
        this.setupSky();
        this.setupLighting();
        this.setupGround();
    }

    setupSky() {
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
    }

    setupLighting() {
        // Ambient light for overall brightness
        const ambientLight = new THREE.AmbientLight(0x808080, 2.5);
        this.scene.add(ambientLight);

        // Directional light for shadows
        const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
        directionalLight.position.set(5, 10, 7.5);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
    }

    setupGround() {
        const grassTexture = this.createGrassTexture();
        const groundGeo = new THREE.PlaneGeometry(100, 100);
        const groundMat = new THREE.MeshStandardMaterial({
            map: grassTexture,
            roughness: 0.9
        });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        ground.userData.type = 'ground';
        this.scene.add(ground);
    }

    createGrassTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Base grass color (darker green)
        const baseColor = '#4a7c3a';
        ctx.fillStyle = baseColor;
        ctx.fillRect(0, 0, 512, 512);

        // Add variation with lighter and darker patches
        for (let i = 0; i < 5000; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const size = Math.random() * 3 + 1;

            // Random green shades
            const brightness = Math.random() * 60 - 30; // -30 to +30
            const r = Math.min(255, Math.max(0, 74 + brightness));
            const g = Math.min(255, Math.max(0, 124 + brightness));
            const b = Math.min(255, Math.max(0, 58 + brightness));

            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.fillRect(x, y, size, size);
        }

        // Add grass blades (small lines)
        ctx.strokeStyle = 'rgba(90, 140, 70, 0.3)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 2000; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const length = Math.random() * 4 + 2;
            const angle = Math.random() * 0.4 - 0.2; // Slight angle variation

            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + Math.sin(angle) * length, y - length);
            ctx.stroke();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(20, 20); // Tile the texture

        return texture;
    }
}
