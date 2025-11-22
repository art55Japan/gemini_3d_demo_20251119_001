import * as THREE from 'three';
import { Entity } from './Entity.js';

export class Slime extends Entity {
    constructor(x, z) {
        super();
        this.type = 'Slime';
        this.position = new THREE.Vector3(x, 0.5, z);
        this.originalY = 0.5;
        this.mesh = this.buildSlime();
        this.mesh.position.copy(this.position);

        // Store reference
        this.mesh.userData.entity = this;

        // Animation properties
        this.timeOffset = Math.random() * 100;
        this.bounceSpeed = 3.0;
        this.bounceHeight = 0.3;

        this.isDead = false;
    }

    handleCollision(player, physics) {
        if (this.isDead) return;

        const collisionRange = 0.8;
        // Use mesh position for accurate animation-based collision
        const slimePos = this.mesh.position;
        const dist = player.position.distanceTo(slimePos);

        if (dist < collisionRange) {
            console.log(`[HIT] Slime collision! Distance: ${dist.toFixed(2)}`);

            const knockbackDir = player.position.clone().sub(slimePos).normalize();
            physics.applyKnockback(knockbackDir, 15.0);

            if (player.audioManager) player.audioManager.playHit();
        }
    }

    update(delta, input, time) {
        if (this.isDead) return;

        // Simple Bounce Animation
        const bounce = Math.sin((time + this.timeOffset) * this.bounceSpeed) * this.bounceHeight;
        this.mesh.position.y = this.originalY + Math.abs(bounce);

        // Sync logical position (optional, but good for consistency)
        this._position.copy(this.mesh.position);
    }

    createFeltTexture(colorHex) {
        const canvas = document.createElement('canvas');
        canvas.width = 256; // Smaller texture for enemies
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

    buildSlime() {
        const group = new THREE.Group();

        // Materials
        const greenFeltTex = this.createFeltTexture('#32CD32'); // Lime Green
        const greenFelt = new THREE.MeshStandardMaterial({
            map: greenFeltTex,
            bumpMap: greenFeltTex,
            bumpScale: 0.02,
            roughness: 1.0
        });

        const plasticBlack = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.1, metalness: 0.1 });

        // Body
        // Slightly flattened sphere
        const bodyGeo = new THREE.SphereGeometry(0.4, 32, 32);
        const body = new THREE.Mesh(bodyGeo, greenFelt);
        body.scale.set(1, 0.8, 1); // Flatten
        body.castShadow = true;
        group.add(body);

        // Eyes
        const eyeGeo = new THREE.SphereGeometry(0.08, 16, 16);

        const eyeL = new THREE.Mesh(eyeGeo, plasticBlack);
        eyeL.position.set(-0.15, 0.1, 0.3);
        group.add(eyeL);

        const eyeR = new THREE.Mesh(eyeGeo, plasticBlack);
        eyeR.position.set(0.15, 0.1, 0.3);
        group.add(eyeR);

        // Eye Highlights
        const highlightGeo = new THREE.SphereGeometry(0.02);
        const highlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

        const highlightL = new THREE.Mesh(highlightGeo, highlightMat);
        highlightL.position.set(-0.03, 0.03, 0.07);
        eyeL.add(highlightL);

        const highlightR = new THREE.Mesh(highlightGeo, highlightMat);
        highlightR.position.set(-0.03, 0.03, 0.07);
        eyeR.add(highlightR);

        return group;
    }

    update(delta, input, time) {
        if (this.isDead) {
            // Death Animation: Shrink
            const shrinkSpeed = 2.0;
            this.mesh.scale.subScalar(shrinkSpeed * delta);

            if (this.mesh.scale.y <= 0.01) {
                this.mesh.scale.set(0, 0, 0);
                this.shouldRemove = true;
            }
            return;
        }

        // Bounce Animation
        const bounce = Math.sin((time + this.timeOffset) * this.bounceSpeed);

        // Position Y change
        // Map sin wave (-1 to 1) to (0 to 1) for height
        const heightFactor = (bounce + 1) * 0.5;
        this.mesh.position.y = this.originalY + heightFactor * this.bounceHeight;

        // Squash and Stretch
        // When hitting ground (bounce near -1), squash (scale Y down, X/Z up)
        // When in air (bounce near 1), stretch (scale Y up, X/Z down)
        const scaleY = 0.8 + (bounce * 0.1); // Base 0.8 +/- 0.1
        const scaleXZ = 1.0 - (bounce * 0.05); // Inverse of Y

        this.mesh.scale.set(scaleXZ, scaleY, scaleXZ);
    }

    takeDamage() {
        if (this.isDead) return;
        this.isDead = true;
    }
}
