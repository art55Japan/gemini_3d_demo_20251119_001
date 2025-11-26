import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { Player } from './Player.js';
import { Input } from './Input.js';
import { EntityManager } from './EntityManager.js';
import { AudioManager } from './AudioManager.js';
import { CameraManager } from './CameraManager.js';
import { WorldManager } from './WorldManager.js';
import { BuildSystem } from './BuildSystem.js';
import { SaveManager } from './SaveManager.js';
import { SaveLoadUI } from './SaveLoadUI.js';
import { Block } from './Block.js';
import { AnimationParameters } from './config/AnimationParameters.js';
import { CameraParameters } from './config/CameraParameters.js';
import { PlayerParameters } from './config/PlayerParameters.js';

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

        // Click to Start Overlay - DISABLED for easier debugging
        /*
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
        overlay.innerHTML = 'Click to Start<br><span style="font-size: 16px">WASD/Arrows to Move | Space to Jump | Click to Attack<br>B: Build Mode | K: Quick Save | L: Quick Load | M: Data Menu</span>';
        document.body.appendChild(overlay);

        overlay.addEventListener('click', () => {
            overlay.style.display = 'none';
            this.audioManager.resumeContext();
            // Ensure focus is on window
            window.focus();
        });
        */

        // Auto-resume audio context
        this.audioManager.resumeContext();

        // Start BGM on first interaction (backup)
        window.addEventListener('keydown', () => {
            this.audioManager.resumeContext();
        }, { once: true });

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x808080, 2.5); // Brighter ambient to soften shadows
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
        directionalLight.position.set(5, 10, 7.5);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);

        // Ground with grass texture
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

        // Input
        this.input = new Input(this.renderer);

        // Entity Manager
        this.entityManager = new EntityManager(this.scene);

        // Create parameter objects
        const animationParams = new AnimationParameters();
        const cameraParams = new CameraParameters();
        const playerParams = new PlayerParameters();

        // Player
        this.player = new Player(this.scene, this.audioManager, animationParams, playerParams);
        this.entityManager.add(this.player);

        // Environment
        this.collidables = []; // Array to store objects the player can stand on

        // World Manager
        this.worldManager = new WorldManager(this.entityManager, this.collidables);
        this.worldManager.populate();

        // Build System
        this.buildSystem = new BuildSystem(this.scene, this.camera, this.entityManager, this.collidables);
        this.buildSystem.setPlayer(this.player);

        this.clock = new THREE.Clock();

        window.addEventListener('resize', this.onWindowResize.bind(this));

        this.camera.lookAt(this.player.position);

        // Camera Manager
        this.cameraManager = new CameraManager(this.camera, this.player, this.renderer, cameraParams);

        // Save Manager
        this.saveManager = new SaveManager(this);
        this.saveLoadUI = new SaveLoadUI(this, this.saveManager);
        this.lastSaveTime = 0;
        this.lastLoadTime = 0;
        this.lastMenuTime = 0;

        this.createNotificationUI();

        // Create initial castle
        this.createInitialCastle();
    }

    createInitialCastle() {
        console.log("Creating initial castle...");

        const castleX = -10;
        const castleZ = -10;
        const size = 8;
        const height = 6;

        // Declarative block generation
        // Generate all coordinates first, then filter
        const coordinates = [];
        for (let y = 1; y <= height; y++) {
            for (let x = 0; x < size; x++) {
                for (let z = 0; z < size; z++) {
                    coordinates.push({ x, y, z });
                }
            }
        }

        coordinates
            .filter(({ x, z }) => x === 0 || x === size - 1 || z === 0 || z === size - 1) // Walls only
            .filter(({ x, y, z }) => !(y > 2 && (x + z) % 3 === 0)) // Windows
            .forEach(({ x, y, z }) => {
                const block = new Block(castleX + x, y, castleZ + z, 'stone_dark');
                this.entityManager.add(block);
                this.collidables.push(block.mesh);
            });

        console.log("Castle created!");
    }

    createNotificationUI() {
        this.notification = document.createElement('div');
        this.notification.style.position = 'absolute';
        this.notification.style.top = '20px';
        this.notification.style.right = '20px';
        this.notification.style.padding = '10px 20px';
        this.notification.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        this.notification.style.color = 'white';
        this.notification.style.borderRadius = '5px';
        this.notification.style.fontFamily = 'sans-serif';
        this.notification.style.display = 'none';
        this.notification.style.transition = 'opacity 0.5s';
        document.body.appendChild(this.notification);
    }

    showNotification(message, duration = 2000) {
        this.notification.innerText = message;
        this.notification.style.display = 'block';
        this.notification.style.opacity = '1';

        if (this.notificationTimeout) clearTimeout(this.notificationTimeout);

        this.notificationTimeout = setTimeout(() => {
            this.notification.style.opacity = '0';
            setTimeout(() => {
                this.notification.style.display = 'none';
            }, 500);
        }, duration);
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

            // Quick Save/Load (K/L)
            if (inputState.save && time - this.lastSaveTime > 1.0) {
                this.saveManager.quickSave();
                this.lastSaveTime = time;
            }
            if (inputState.load && time - this.lastLoadTime > 1.0) {
                this.saveManager.quickLoad();
                this.lastLoadTime = time;
            }
            if (this.saveLoadUI.isVisible) {
                // Still render scene but maybe with a blur or just static?
                // For now, just render
                this.renderer.render(this.scene, this.camera);
                return;
            }

            this.buildSystem.update(delta, inputState);

            this.entityManager.update(delta, inputState, time, this.collidables);

            this.cameraManager.update(delta, inputState);

            this.renderer.render(this.scene, this.camera);

        } catch (e) {
            console.error("Game Loop Error:", e);
            // Stop the loop to prevent flooding
            this.renderer.setAnimationLoop(null);
            alert("Game Crashed: " + e.message);
        }
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
