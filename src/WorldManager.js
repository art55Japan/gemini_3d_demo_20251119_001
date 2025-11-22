import { Tree } from './Tree.js';
import { Rock } from './Rock.js';
import { Slime } from './Slime.js';

export class WorldManager {
    constructor(entityManager, collidables) {
        this.entityManager = entityManager;
        this.collidables = collidables;
    }

    populate() {
        // Trees - generate positions then filter
        const treePositions = Array.from({ length: 20 }, () => ({
            x: (Math.random() - 0.5) * 40,
            z: (Math.random() - 0.5) * 40
        })).filter(pos => Math.abs(pos.x) >= 3 || Math.abs(pos.z) >= 3);

        treePositions.forEach(pos => {
            const tree = new Tree(pos.x, pos.z);
            this.entityManager.add(tree);
        });

        // Rocks - generate positions then filter
        const rockPositions = Array.from({ length: 15 }, () => ({
            x: (Math.random() - 0.5) * 40,
            z: (Math.random() - 0.5) * 40,
            scale: 0.5 + Math.random() * 1.0
        })).filter(pos => Math.abs(pos.x) >= 2 || Math.abs(pos.z) >= 2);

        rockPositions.forEach(pos => {
            const rock = new Rock(pos.x, pos.z, pos.scale);
            this.entityManager.add(rock);
            this.collidables.push(rock.mesh);
        });

        // Slimes - generate positions then filter
        const slimePositions = Array.from({ length: 10 }, () => ({
            x: (Math.random() - 0.5) * 30,
            z: (Math.random() - 0.5) * 30
        })).filter(pos => Math.abs(pos.x) >= 5 || Math.abs(pos.z) >= 5);

        slimePositions.forEach(pos => {
            const slime = new Slime(pos.x, pos.z);
            this.entityManager.add(slime);
        });
    }
}
