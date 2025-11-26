import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Entity } from './Entity.js';

// State Interface
class SlimeState {
    constructor(slime) {
        this.slime = slime;
    }
    enter() { }
    update(delta, time) { }
    handleCollision(player, physics) { }
    takeDamage() { }
}

class AliveState extends SlimeState {
    update(delta, time) {
        // Bounce Animation
        const bounce = Math.sin((time + this.slime.timeOffset) * this.slime.bounceSpeed);

        // Position Y change
        const heightFactor = (bounce + 1) * 0.5;
        this.slime.mesh.position.y = this.slime.originalY + heightFactor * this.slime.bounceHeight;

        // Squash and Stretch (adjusted for 1.3x scale)
        const baseScale = 1.3; // 1.3x base scale
        const scaleY = baseScale * (0.8 + (bounce * 0.1));
        const scaleXZ = baseScale * (1.0 - (bounce * 0.05));
        this.slime.mesh.scale.set(scaleXZ, scaleY, scaleXZ);

        // Sync logical position
        this.slime.position.copy(this.slime.mesh.position);
    }

    handleCollision(player, physics) {
        // Adjusted for 1.3x scale: base radius (0.4) * scale (1.3) + padding (0.52)
        const collisionRange = 1.04;
        const slimePos = this.slime.mesh.position;
        const dist = player.position.distanceTo(slimePos);

        if (dist < collisionRange) {
            console.log(`[HIT] Slime collision! Distance: ${dist.toFixed(2)}`);
            const knockbackDir = player.position.clone().sub(slimePos).normalize();
            physics.applyKnockback(knockbackDir, 15.0);
            if (player.audioManager) player.audioManager.playHit();
        }
    }

    takeDamage() {
        this.slime.setState(new DeadState(this.slime));
    }
}

class DeadState extends SlimeState {
    update(delta, time) {
        // Death Animation: Shrink
        const shrinkSpeed = 2.0;
        this.slime.mesh.scale.subScalar(shrinkSpeed * delta);

        if (this.slime.mesh.scale.y <= 0.01) {
            this.slime.mesh.scale.set(0, 0, 0);
            this.slime.shouldRemove = true;
        }
    }

    handleCollision(player, physics) {
        // No collision
    }

    takeDamage() {
        // Already dead
    }
}

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

        this.currentState = new AliveState(this);
    }

    setState(newState) {
        this.currentState = newState;
        this.currentState.enter();
    }

    handleCollision(player, physics) {
        this.currentState.handleCollision(player, physics);
    }

    update(delta, input, time) {
        this.currentState.update(delta, time);
    }

    takeDamage() {
        this.currentState.takeDamage();
    }

    buildSlime() {
        const group = new THREE.Group();

        // Load 3D model
        const loader = new GLTFLoader();
        loader.load('/models/slime_001.glb', (gltf) => {
            const model = gltf.scene;

            // Scale to 1.3x size
            model.scale.set(1.3, 1.3, 1.3);

            // Random rotation on Y-axis (0 to 2π)
            model.rotation.y = Math.random() * Math.PI * 2;

            // Enable shadows
            model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            // Store model reference for animation
            this.model = model;
            group.add(model);
        }, undefined, (error) => {
            console.error('Error loading slime model:', error);
            // Fallback: create simple placeholder
            const geo = new THREE.SphereGeometry(0.4, 16, 16);
            const mat = new THREE.MeshStandardMaterial({ color: 0x32CD32 });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.castShadow = true;
            group.add(mesh);
        });

        return group;
    }

    // Polymorphic save methods
    isSaveable() {
        // Only save alive slimes
        return this.currentState instanceof AliveState;
    }

    toSaveData() {
        return {
            type: 'slime',
            x: this.position.x,
            z: this.position.z
        };
    }

    static fromSaveData(data) {
        return new Slime(data.x, data.z);
    }
}
