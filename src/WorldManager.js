import { Tree } from './Tree.js';
import { Rock } from './Rock.js';
import { Slime } from './Slime.js';

export class WorldManager {
    constructor(entityManager, collidables) {
        this.entityManager = entityManager;
        this.collidables = collidables;
    }

    populate() {
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
}
