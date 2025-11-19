import * as THREE from 'three';

export class EntityManager {
    constructor(scene) {
        this.scene = scene;
        this.entities = [];
    }

    add(entity) {
        this.entities.push(entity);
        if (entity.mesh) {
            this.scene.add(entity.mesh);
        }
    }

    remove(entity) {
        const index = this.entities.indexOf(entity);
        if (index > -1) {
            this.entities.splice(index, 1);
            if (entity.mesh) {
                this.scene.remove(entity.mesh);
            }
        }
    }

    update(delta, input, time, collidables) {
        for (const entity of this.entities) {
            if (entity.update) {
                entity.update(delta, input, time, collidables, this.entities);
            }
            if (entity.shouldRemove) {
                this.remove(entity);
            }
        }
    }
}
