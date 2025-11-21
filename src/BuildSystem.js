import * as THREE from 'three';
import { Block } from './Block.js';

export class BuildSystem {
    constructor(scene, camera, entityManager, collidables) {
        this.scene = scene;
        this.camera = camera;
        this.entityManager = entityManager;
        this.collidables = collidables;
        this.player = null; // Needs to be set after player creation

        this.buildMode = false;
        this.buildCooldown = 0;
        this.ghostBlock = this.createGhostBlock();
        this.scene.add(this.ghostBlock);
    }

    setPlayer(player) {
        this.player = player;
    }

    createGhostBlock() {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({
            color: 0x00FF00,
            transparent: true,
            opacity: 0.5,
            wireframe: true
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.visible = false;
        return mesh;
    }

    update(delta, input) {
        // Toggle Build Mode
        if (input.toggleBuildMode && this.buildCooldown <= 0) {
            this.buildMode = !this.buildMode;
            this.buildCooldown = 0.5; // Debounce
            this.ghostBlock.visible = this.buildMode;
            console.log(`Build Mode: ${this.buildMode}`);
        }
        if (this.buildCooldown > 0) this.buildCooldown -= delta;

        if (!this.buildMode) return;

        const hit = this.getRaycastHit(input);

        this.updateGhostBlock(hit);

        if (hit) {
            this.handleBlockPlacement(input, hit);
            this.handleBlockRemoval(input, hit);
        }
    }

    getRaycastHit(input) {
        // Raycast from mouse position
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(input.mouse.x, input.mouse.y), this.camera);

        // Intersect with everything (ground, objects, blocks)
        const interactables = [...this.collidables];

        // Let's add a ground plane for raycasting here.
        const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const target = new THREE.Vector3();
        const ray = raycaster.ray;

        // Check intersection with ground plane
        let groundHit = null;
        const distanceToGround = ray.intersectPlane(groundPlane, target);
        if (distanceToGround !== null) {
            groundHit = {
                point: target,
                face: { normal: new THREE.Vector3(0, 1, 0) }, // Up normal
                object: { userData: { type: 'ground' } }
            };
        }

        // Check intersection with entities (Excluding Player)
        this.entityManager.entities.forEach(e => {
            if (e !== this.player) {
                interactables.push(e.mesh);
            }
        });
        const intersects = raycaster.intersectObjects(interactables, true);

        let hit = null;
        if (intersects.length > 0) {
            hit = intersects[0];
            // If ground is closer, use ground
            if (groundHit && distanceToGround < hit.distance) {
                hit = groundHit;
            }
        } else {
            hit = groundHit;
        }
        return hit;
    }

    updateGhostBlock(hit) {
        if (hit) {
            const point = hit.point;
            const normal = hit.face.normal;

            // Calculate Grid Position
            const targetPos = point.clone().add(normal.clone().multiplyScalar(0.5));

            const gridX = Math.round(targetPos.x);
            const gridY = Math.round(targetPos.y);
            const gridZ = Math.round(targetPos.z);

            this.ghostBlock.position.set(gridX, gridY, gridZ);
            this.ghostBlock.visible = true;
        } else {
            this.ghostBlock.visible = false;
        }
    }

    handleBlockPlacement(input, hit) {
        // Place Block
        if (input.placeBlock && this.buildCooldown <= 0) {
            const point = hit.point;
            const normal = hit.face.normal;
            const targetPos = point.clone().add(normal.clone().multiplyScalar(0.5));
            const gridX = Math.round(targetPos.x);
            const gridY = Math.round(targetPos.y);
            const gridZ = Math.round(targetPos.z);

            const block = new Block(gridX, gridY, gridZ, 'dirt');
            this.entityManager.add(block);
            this.collidables.push(block.mesh); // Add to collidables for player physics
            this.buildCooldown = 0.2;
        }
    }

    handleBlockRemoval(input, hit) {
        // Remove Block
        if (input.removeBlock && this.buildCooldown <= 0) {
            if (hit.object.userData.entity instanceof Block) {
                const blockToRemove = hit.object.userData.entity;
                blockToRemove.shouldRemove = true; // EntityManager will handle cleanup

                // Remove from collidables
                const index = this.collidables.indexOf(blockToRemove.mesh);
                if (index > -1) this.collidables.splice(index, 1);

                this.buildCooldown = 0.2;
            }
        }
    }
}
