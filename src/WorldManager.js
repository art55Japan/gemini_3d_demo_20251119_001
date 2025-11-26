import { Tree } from './Tree.js';
import { Rock } from './Rock.js';
import { Slime } from './Slime.js';
import { Block } from './Block.js';

export class WorldManager {
    constructor(entityManager, collidables) {
        this.entityManager = entityManager;
        this.collidables = collidables;
    }

    populate() {
        // Create initial castle structure
        this.createInitialCastle();

        // Spawn entities
        this.spawnEntities();
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

    spawnEntities() {
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
