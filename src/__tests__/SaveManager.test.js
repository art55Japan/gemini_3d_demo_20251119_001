import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SaveManager } from '../SaveManager.js';
import { Block } from '../Block.js';
import { Tree } from '../Tree.js';

// Mock Game class
class MockGame {
    constructor() {
        this.player = {
            position: { x: 0, y: 0, z: 0, toArray: () => [0, 0, 0], fromArray: vi.fn() },
            mesh: { rotation: { y: 0 } },
            physics: { velocity: { set: vi.fn() }, onGround: false }
        };
        this.entityManager = {
            entities: [],
            add: vi.fn(),
            remove: vi.fn()
        };
        this.collidables = [];
        this.showNotification = vi.fn();
    }
}

describe('SaveManager', () => {
    let game;
    let saveManager;

    beforeEach(() => {
        game = new MockGame();
        saveManager = new SaveManager(game);
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('should save saveable entities (Block)', () => {
        const block = new Block(1, 1, 1, 'dirt');
        game.entityManager.entities.push(block);

        const saveData = saveManager._createSaveData('test');
        expect(saveData.blocks).toHaveLength(1);
        expect(saveData.blocks[0].x).toBe(1);
    });

    it('should NOT save non-saveable entities (Tree)', () => {
        const tree = new Tree(2, 2);
        game.entityManager.entities.push(tree);

        const saveData = saveManager._createSaveData('test');
        expect(saveData.blocks).toHaveLength(0);
        expect(saveData.enemies).toHaveLength(0);
    });

    it('should preserve non-saveable entities during restore', () => {
        // Setup existing entities
        const existingBlock = new Block(0, 0, 0, 'dirt');
        const existingTree = new Tree(5, 5);

        // Mock isSaveable for Tree (it returns false or is undefined)
        // Tree.js has isSaveable() { return false; }

        game.entityManager.entities = [existingBlock, existingTree];
        game.collidables = [existingBlock.mesh, existingTree.mesh]; // Mock collidables

        // Save data to restore (empty)
        const saveData = { blocks: [], enemies: [] };

        saveManager._restoreSaveData(saveData);

        // Block should be removed (it's saveable but not in saveData)
        expect(game.entityManager.remove).toHaveBeenCalledWith(existingBlock);

        // Tree should NOT be removed (it's not saveable)
        expect(game.entityManager.remove).not.toHaveBeenCalledWith(existingTree);
    });
});
