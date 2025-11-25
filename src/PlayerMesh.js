import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class PlayerMesh {
    constructor(animationParams, playerParams) {
        this.animationParams = animationParams;
        this.playerParams = playerParams;
        this.model = null;
        this.headMesh = null;
        this.animationTime = 0;
        this.initialModelY = 0;
    }

    create() {
        const group = new THREE.Group();
        const loader = new GLTFLoader();
        loader.load('/models/modified_model.glb', (gltf) => {
            const model = gltf.scene;
            // Rotate to face away from camera
            model.rotation.y = this.playerParams.initialRotationY;
            // Debug logs & normalization
            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());
            console.log(`Player Model Loaded! Size: ${size.x.toFixed(2)}, ${size.y.toFixed(2)}, ${size.z.toFixed(2)}`);
            console.log(`Model Center: ${center.x.toFixed(2)}, ${center.y.toFixed(2)}, ${center.z.toFixed(2)}`);
            // Scale to target height
            const scaleFactor = this.playerParams.targetHeight / size.y;
            if (isFinite(scaleFactor) && scaleFactor > 0) {
                model.scale.set(scaleFactor, scaleFactor, scaleFactor);
                console.log(`Applied Scale Factor: ${scaleFactor.toFixed(4)}`);
                // Re‑center so feet are at Y = 0
                const newBox = new THREE.Box3().setFromObject(model);
                const newMin = newBox.min;
                model.position.y -= newMin.y;
                console.log(`Adjusted Y Position by: ${-newMin.y.toFixed(4)}`);
                // Store initial Y for animation
                this.initialModelY = model.position.y;
            }

            // Enable shadows for all meshes
            model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            // Store references for animation
            this.model = model;
            this.headMesh = null;
            group.add(model);
        }, undefined, (error) => {
            console.error('An error happened loading the player model:', error);
        });
        return group;
    }

    // Walking animation
    update(delta, velocity) {
        if (!this.model) return;
        const speed = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z);
        if (speed > this.animationParams.speedThreshold) {
            this.animationTime += delta * this.animationParams.timeMultiplier;
            const bobOffset = Math.abs(Math.sin(this.animationTime)) * this.animationParams.bobAmount;
            this.model.position.y = (this.initialModelY || 0) + bobOffset;
            const tiltOffset = Math.sin(this.animationTime * 2) * this.animationParams.tiltAmount;
            this.model.rotation.z = tiltOffset;
        } else {
            const targetY = this.initialModelY || 0;
            this.model.position.y += (targetY - this.model.position.y) * this.animationParams.lerpFactor;
            this.model.rotation.z += (0 - this.model.rotation.z) * this.animationParams.lerpFactor;
            if (Math.abs(this.model.position.y - targetY) < 0.001) this.model.position.y = targetY;
            if (Math.abs(this.model.rotation.z) < 0.001) this.model.rotation.z = 0;
        }
    }
}
