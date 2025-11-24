import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class PlayerMesh {
    create() {
        const group = new THREE.Group();

        const loader = new GLTFLoader();
        // Load the correct model identified from logs
        loader.load('/models/new_rabbit_model.glb', (gltf) => {
            const model = gltf.scene;

            // Adjust scale and rotation to match the game world
            model.rotation.y = Math.PI / 2; // +90 degrees to face away from camera

            // Debug logs & Normalization
            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());

            console.log(`Player Model Loaded! Size: ${size.x.toFixed(2)}, ${size.y.toFixed(2)}, ${size.z.toFixed(2)}`);
            console.log(`Model Center: ${center.x.toFixed(2)}, ${center.y.toFixed(2)}, ${center.z.toFixed(2)}`);

            // Target height ~1.5 units
            const targetHeight = 1.5;
            const scaleFactor = targetHeight / size.y;

            if (isFinite(scaleFactor) && scaleFactor > 0) {
                model.scale.set(scaleFactor, scaleFactor, scaleFactor);
                console.log(`Applied Scale Factor: ${scaleFactor.toFixed(4)}`);

                // Re-center if needed (e.g. if origin is at center of body, move it up so feet are at 0)
                // We want the bottom of the box to be at 0
                const newBox = new THREE.Box3().setFromObject(model);
                const newMin = newBox.min;
                model.position.y -= newMin.y;
                console.log(`Adjusted Y Position by: ${-newMin.y.toFixed(4)}`);
            }

            // FINAL Material Configuration
            const materials = {
                felt: new THREE.MeshStandardMaterial({
                    color: 0xFFFFFF, // Pure White
                    roughness: 1.0,  // Matte
                    metalness: 0.0,
                    emissive: 0x333333, // Self-illumination
                }),
                armor: new THREE.MeshStandardMaterial({
                    color: 0xFAFAFA, // Slightly whiter silver (near white)
                    roughness: 0.1,
                    metalness: 0.9,
                }),
                eye: new THREE.MeshStandardMaterial({
                    color: 0x000000, // Black eye
                    roughness: 0.5,
                    metalness: 0.0,
                    emissive: 0x111111, // slight dim glow
                }),
                cape: new THREE.MeshStandardMaterial({
                    color: 0x0000FF, // Blue
                    roughness: 0.8,
                    metalness: 0.1,
                }),
            };

            // Apply materials to parts
            let colorIndex = 0;
            let headMesh = null; // reference to head (Part 8)

            model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;

                    if (child.material) {
                        let mat;
                        let partType;

                        // Store head mesh reference (Part 8)
                        if (colorIndex === 8) {
                            headMesh = child;
                        }

                        // Part 8, 12 = Felt (White)
                        if (colorIndex === 8 || colorIndex === 12) {
                            mat = materials.felt;
                            partType = 'FELT';
                        }
                        // Part 9 ONLY = Cape (Blue)
                        else if (colorIndex === 9) {
                            mat = materials.cape;
                            partType = 'CAPE';
                        }
                        // All others = Armor (Silver)
                        else {
                            mat = materials.armor;
                            partType = 'ARMOR';
                        }

                        child.material = mat.clone();
                        console.log(`Part ${colorIndex} ("${child.name}") = ${partType}`);
                        colorIndex++;
                    }
                }
            });

            // Add two eye placeholder spheres attached to head mesh
            if (headMesh) {
                // Left eye
                const eyeSphereLeft = new THREE.Mesh(
                    new THREE.SphereGeometry(0.03, 16, 16),
                    materials.eye
                );
                // Position for left eye (original position)
                eyeSphereLeft.position.set(0.1, 0.14, 0.1);
                headMesh.add(eyeSphereLeft);

                // Left eye highlight
                const highlightLeft = new THREE.Mesh(
                    new THREE.SphereGeometry(0.01, 8, 8),
                    new THREE.MeshBasicMaterial({
                        color: 0xFFFFFF,
                        transparent: true,
                        opacity: 0.9
                    })
                );
                highlightLeft.position.set(0.01, 0.01, 0.015);
                eyeSphereLeft.add(highlightLeft);

                // Right eye
                const eyeSphereRight = new THREE.Mesh(
                    new THREE.SphereGeometry(0.03, 16, 16),
                    materials.eye
                );
                // Position for right eye (Z axis controls left-right positioning)
                eyeSphereRight.position.set(0.1, 0.14, -0.05);
                headMesh.add(eyeSphereRight);

                // Right eye highlight
                const highlightRight = new THREE.Mesh(
                    new THREE.SphereGeometry(0.01, 8, 8),
                    new THREE.MeshBasicMaterial({
                        color: 0xFFFFFF,
                        transparent: true,
                        opacity: 0.9
                    })
                );
                highlightRight.position.set(0.01, 0.01, 0.015);
                eyeSphereRight.add(highlightRight);
            }

            group.add(model);
        }, undefined, (error) => {
            console.error('An error happened loading the player model:', error);
        });

        return group;
    }
}
