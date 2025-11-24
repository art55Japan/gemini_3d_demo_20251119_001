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
        loader.load('/models/new_rabbit_model.glb', (gltf) => {
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
            // Materials
            const materials = {
                felt: new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 1.0, metalness: 0.0, emissive: 0x333333 }),
                armor: new THREE.MeshStandardMaterial({ color: 0xFAFAFA, roughness: 0.1, metalness: 0.9 }),
                eye: new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.5, metalness: 0.0, emissive: 0x111111 }),
                cape: new THREE.MeshStandardMaterial({ color: 0x0000FF, roughness: 0.8, metalness: 0.1 })
            };
            // Apply materials and locate head mesh (part 8)
            let colorIndex = 0;
            let headMesh = null;
            model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    if (child.material) {
                        let mat;
                        let partType;
                        if (colorIndex === 8) headMesh = child;
                        if (colorIndex === 8 || colorIndex === 12) { mat = materials.felt; partType = 'FELT'; }
                        else if (colorIndex === 9) { mat = materials.cape; partType = 'CAPE'; }
                        else { mat = materials.armor; partType = 'ARMOR'; }
                        child.material = mat.clone();
                        console.log(`Part ${colorIndex} ("${child.name}") = ${partType}`);
                        colorIndex++;
                    }
                }
            });
            // Eyes with highlights
            if (headMesh) {
                const eyeSphereLeft = new THREE.Mesh(new THREE.SphereGeometry(0.03, 16, 16), materials.eye);
                eyeSphereLeft.position.set(0.1, 0.14, 0.1);
                headMesh.add(eyeSphereLeft);
                const highlightLeft = new THREE.Mesh(new THREE.SphereGeometry(0.01, 8, 8), new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.9 }));
                highlightLeft.position.set(0.01, 0.01, 0.015);
                eyeSphereLeft.add(highlightLeft);
                const eyeSphereRight = new THREE.Mesh(new THREE.SphereGeometry(0.03, 16, 16), materials.eye);
                eyeSphereRight.position.set(0.1, 0.14, -0.05);
                headMesh.add(eyeSphereRight);
                const highlightRight = new THREE.Mesh(new THREE.SphereGeometry(0.01, 8, 8), new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.9 }));
                highlightRight.position.set(0.01, 0.01, 0.015);
                eyeSphereRight.add(highlightRight);
            }
            // Store references for animation
            this.model = model;
            this.headMesh = headMesh;
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
