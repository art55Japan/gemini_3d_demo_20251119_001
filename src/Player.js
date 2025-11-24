import * as THREE from 'three';
import { PlayerMesh } from './PlayerMesh.js';
import { PlayerPhysics } from './PlayerPhysics.js';
import { PlayerCombat } from './PlayerCombat.js';
import { PlayerCollision } from './PlayerCollision.js';

export class Player {
    constructor(scene, audioManager, animationParams, playerParams) {
        this.scene = scene;
        this.audioManager = audioManager;
        this.position = new THREE.Vector3(0, 0, 0);

        // Create PlayerMesh instance and its group
        this.playerMesh = new PlayerMesh(animationParams, playerParams);
        this.mesh = this.playerMesh.create();
        this.mesh.position.copy(this.position);
        this.mesh.rotation.y = 0; // Face Forward (-Z) by default
        this.scene.add(this.mesh);

        // Components
        this.physics = new PlayerPhysics(this);
        this.combat = new PlayerCombat(this);
        this.collision = new PlayerCollision(this);
    }

    buildCharacter() {
        return new PlayerMesh().create();
    }

    update(delta, input, time, collidables, entities) {
        // Emergency Reset
        if (input.reset) {
            this.position.set(0, 0.5, 0);
            this.physics.reset();
            this.mesh.rotation.y = 0;
            console.log("Player Reset");
        }

        // Rotation (Manual)
        const rotationSpeed = 3.0;
        const rotationDir = (input.rotateLeft ? 1 : 0) - (input.rotateRight ? 1 : 0);
        this.mesh.rotation.y += rotationDir * rotationSpeed * delta;

        // Physics Update (Movement, Gravity, Jump)
        this.physics.update(delta, input, collidables);
        // Update walking animation
        if (this.playerMesh) {
            this.playerMesh.update(delta, this.physics.velocity);
        }
        // Sync Mesh Position
        this.mesh.position.copy(this.position);

        // Combat Update
        this.combat.update(delta, input, entities);

        // Check Collisions with Enemies
        this.checkCollisions(entities);
    }

    checkCollisions(entities) {
        this.collision.checkCollisions(entities, this.physics);
    }

    // Player is saved separately in SaveManager, so return false here
    isSaveable() {
        return false;
    }
}
