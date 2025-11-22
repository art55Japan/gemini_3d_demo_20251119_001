import * as THREE from 'three';

export class Entity {
    constructor() {
        this.type = 'Entity';
        this.mesh = null;
        this._position = new THREE.Vector3();
        this.shouldRemove = false;
    }

    get position() {
        return this._position;
    }

    set position(value) {
        this._position.copy(value);
        if (this.mesh) {
            this.mesh.position.copy(value);
        }
    }

    update(delta, input, time, collidables, entities) {
        // Default update: do nothing
    }

    handleCollision(player, physics) {
        // Default collision: do nothing
    }

    isAlive() {
        return !this.shouldRemove;
    }
}
