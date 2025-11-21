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
        overlay.innerHTML = 'Click to Start<br><span style="font-size: 16px">WASD/Arrows to Move | Space to Jump | Click to Attack<br>B: Build Mode | K: Quick Save | L: Quick Load | M: Data Menu</span>';
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
        this.cameraManager = new CameraManager(this.camera, this.player, this.renderer);

        // Save Manager
        this.saveManager = new SaveManager(this);
        this.saveLoadUI = new SaveLoadUI(this, this.saveManager);
        this.lastSaveTime = 0;
        this.lastLoadTime = 0;
        this.lastMenuTime = 0;

        this.createNotificationUI();
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

            // Data Management Menu (M)
            if (inputState.menu && time - this.lastMenuTime > 0.5) {
                if (this.saveLoadUI.isVisible) {
                    this.saveLoadUI.hide();
                } else {
                    this.saveLoadUI.show();
                }
                this.lastMenuTime = time;
            }

            // If UI is open, skip game updates (Pause)
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
}
