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
import { Environment } from './Environment.js';
import { NotificationManager } from './NotificationManager.js';
import { AnimationParameters } from './config/AnimationParameters.js';
import { CameraParameters } from './config/CameraParameters.js';
import { PlayerParameters } from './config/PlayerParameters.js';

export class Game {
    constructor() {
        this.scene = new THREE.Scene();

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


        // Environment (lighting, ground, sky)
        this.environment = new Environment(this.scene);
        this.environment.setup();


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

        // Notification Manager
        this.notificationManager = new NotificationManager();
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

}
