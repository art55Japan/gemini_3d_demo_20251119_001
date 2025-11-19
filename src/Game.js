import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { Player } from './Player.js';
import { Input } from './Input.js';
import { EntityManager } from './EntityManager.js';

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
        this.player = new Player(this.scene);
        this.entityManager.add(this.player);

        this.clock = new THREE.Clock();

        window.addEventListener('resize', this.onWindowResize.bind(this));
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

        this.entityManager.update(delta, inputState, time);

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
