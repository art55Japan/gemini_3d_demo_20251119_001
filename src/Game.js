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
        this.audioManager = new AudioManager();
        // Start BGM on first interaction
        window.addEventListener('click', () => {
            this.audioManager.startBGM();
            this.audioManager.resumeContext();
        }, { once: true });
        window.addEventListener('keydown', () => {
            this.audioManager.startBGM();
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
        // Raycast from camera center
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);

        // Intersect with everything (ground, objects, blocks)
        const interactables = [...this.collidables];
        // Add ground manually if not in collidables (it's not added in constructor, let's fix that or just add it here)
        // Actually ground is not in this.collidables in constructor.
        // But we want to build on ground.
        // Let's find ground mesh. It's the 3rd child added to scene (ambient, directional, ground).
        // Better to keep track of it.
        // For now, let's just iterate scene children or assume ground is at y=0.
        // Wait, I can just add ground to collidables in constructor?
        // No, collidables is for "standing on". Ground is implicit in Player.js?
        // Player.js: "Raycast for Ground/Platform Detection". It uses collidables.
        // If collidables is empty, groundHeight is 0.
        // So Player.js assumes y=0 is ground if no collision.
        // But for building, we need to raycast against the ground plane.

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

        // Check intersection with entities
        this.entityManager.entities.forEach(e => interactables.push(e.mesh));
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
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    render() {
        const delta = this.clock.getDelta();
        const time = this.clock.getElapsedTime();
        const inputState = this.input.getState();

        this.updateBuildMode(delta, inputState);

        this.entityManager.update(delta, inputState, time, this.collidables);

        // Simple camera follow for desktop
        // In VR, the camera is controlled by the headset
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
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    render() {
        const delta = this.clock.getDelta();
        const time = this.clock.getElapsedTime();
        const inputState = this.input.getState();

        this.updateBuildMode(delta, inputState);

        this.entityManager.update(delta, inputState, time, this.collidables);

        // Simple camera follow for desktop
        // In VR, the camera is controlled by the headset
        if (!this.renderer.xr.isPresenting) {
            this.camera.position.x = this.player.position.x;
            this.camera.position.z = this.player.position.z + 3;
            this.camera.lookAt(this.player.position);

        }

        this.renderer.render(this.scene, this.camera);
    }
}
