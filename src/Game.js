import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { Player } from './Player.js';
import { Input } from './Input.js';
import { EntityManager } from './EntityManager.js';
import { Tree } from './Tree.js';
import { Rock } from './Rock.js';
import { Slime } from './Slime.js';
import { Block } from './Block.js';
import { AudioManager } from './AudioManager.js';
import { CameraManager } from './CameraManager.js';

export class Game {
    constructor() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 1.6, 3); // Standard VR height

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.xr.enabled = true;
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild(this.renderer.domElement);
        document.body.appendChild(VRButton.createButton(this.renderer));

        // Audio
        // Audio
        this.audioManager = new AudioManager();

        // Click to Start Overlay
        const overlay = document.createElement('div');
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0,0,0,0.7)';
        overlay.style.color = 'white';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.fontSize = '24px';
        overlay.style.cursor = 'pointer';
        overlay.innerHTML = 'Click to Start';
        document.body.appendChild(overlay);

        overlay.addEventListener('click', () => {
            overlay.style.display = 'none';
            this.audioManager.resumeContext();
            // Ensure focus is on window
            window.focus();
        });

        // Start BGM on first interaction (backup)
        window.addEventListener('keydown', () => {
            this.audioManager.resumeContext();
        }, { once: true });

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 2); // Soft white light
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
        directionalLight.position.set(5, 10, 7.5);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);

        // Ground
        const groundGeo = new THREE.PlaneGeometry(100, 100);
        const groundMat = new THREE.MeshStandardMaterial({ color: 0x999999 });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Input
        this.input = new Input(this.renderer);

        // Entity Manager
        this.entityManager = new EntityManager(this.scene);

        // Player
        this.player = new Player(this.scene, this.audioManager); // Pass audioManager
        this.entityManager.add(this.player);

        // Environment
        this.collidables = []; // Array to store objects the player can stand on
        this.populateWorld();

        // Build Mode State
        this.buildMode = false;
        this.buildCooldown = 0;
        this.ghostBlock = this.createGhostBlock();
        this.scene.add(this.ghostBlock);

        this.clock = new THREE.Clock();

        window.addEventListener('resize', this.onWindowResize.bind(this));

        this.camera.lookAt(this.player.position);

        // Camera Manager
        this.cameraManager = new CameraManager(this.camera, this.player, this.renderer);
    }

    populateWorld() {
        // Trees
        for (let i = 0; i < 20; i++) {
            const x = (Math.random() - 0.5) * 40;
            const z = (Math.random() - 0.5) * 40;
            // Avoid center area
            if (Math.abs(x) < 3 && Math.abs(z) < 3) continue;

            const tree = new Tree(x, z);
            this.entityManager.add(tree);
        }

        // Rocks
        for (let i = 0; i < 15; i++) {
            const x = (Math.random() - 0.5) * 40;
            const z = (Math.random() - 0.5) * 40;
            // Avoid center area
            if (Math.abs(x) < 2 && Math.abs(z) < 2) continue;

            const scale = 0.5 + Math.random() * 1.0;
            const rock = new Rock(x, z, scale);
            this.entityManager.add(rock);

            // Add rock mesh to collidables
            this.collidables.push(rock.mesh);
        }

        // Slimes
        for (let i = 0; i < 10; i++) {
            const x = (Math.random() - 0.5) * 30;
            const z = (Math.random() - 0.5) * 30;
            // Avoid immediate start area
            if (Math.abs(x) < 5 && Math.abs(z) < 5) continue;

            const slime = new Slime(x, z);
            this.entityManager.add(slime);
        }
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

    updateBuildMode(delta, input) {
        // Toggle Build Mode
        if (input.toggleBuildMode && this.buildCooldown <= 0) {
            this.buildMode = !this.buildMode;
            this.buildCooldown = 0.5; // Debounce
            this.ghostBlock.visible = this.buildMode;
            console.log(`Build Mode: ${this.buildMode}`);
        }
        if (this.buildCooldown > 0) this.buildCooldown -= delta;

        if (!this.buildMode) return;

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

            // Place Block
            if (input.placeBlock && this.buildCooldown <= 0) {
                const block = new Block(gridX, gridY, gridZ, 'dirt');
                this.entityManager.add(block);
                this.collidables.push(block.mesh); // Add to collidables for player physics
                this.buildCooldown = 0.2;
            }

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

        } else {
            this.ghostBlock.visible = false;
        }
    }

    start() {
        this.renderer.setAnimationLoop(this.render.bind(this));
    }

    onWindowResize() {
        this.cameraManager.resize(window.innerWidth, window.innerHeight);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    render() {
        try {
            const delta = this.clock.getDelta();
            const time = this.clock.getElapsedTime();
            const inputState = this.input.getState();

            this.updateBuildMode(delta, inputState);

            this.entityManager.update(delta, inputState, time, this.collidables);

            this.cameraManager.update(delta);

            this.renderer.render(this.scene, this.camera);

            this.renderer.render(this.scene, this.camera);
        } catch (e) {
            console.error("Game Loop Error:", e);
            // Stop the loop to prevent flooding
            this.renderer.setAnimationLoop(null);
            alert("Game Crashed: " + e.message);
        }
    }
}
