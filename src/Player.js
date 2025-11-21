import * as THREE from 'three';
import { PlayerMesh } from './PlayerMesh.js';
import { PlayerPhysics } from './PlayerPhysics.js';
import { PlayerCombat } from './PlayerCombat.js';
import { PlayerCollision } from './PlayerCollision.js';

export class Player {
    constructor(scene, audioManager) {
        this.scene = scene;
        this.audioManager = audioManager;
        this.position = new THREE.Vector3(0, 0, 0);

        this.mesh = this.buildCharacter();
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
        if (input.rotateLeft) {
            this.mesh.rotation.y += rotationSpeed * delta;
        }
        if (input.rotateRight) {
            this.mesh.rotation.y -= rotationSpeed * delta;
        }

        // Physics Update (Movement, Gravity, Jump)
        this.physics.update(delta, input, collidables);

        // Ground Detection & Collision
        // const groundHeight = this.collision.getGroundHeight(collidables);

        // Apply Ground Constraints
        // if (this.position.y <= groundHeight) {
        //     this.position.y = groundHeight;
        //     this.physics.velocity.y = 0;
        //     this.physics.onGround = true;
        // } else {
        //     if (this.position.y > groundHeight + 0.1 && this.physics.velocity.y < 0) {
        //         this.physics.onGround = false;
        //     }
        // }

        // Sync Mesh Position
        this.mesh.position.copy(this.position);

        // Combat Update
        this.combat.update(delta, input, entities);

        // Enemy Collision
        this.collision.checkEnemies(entities, this.physics);

        // Environment Collision
        // this.collision.checkEnvironment(entities);
    }
}
