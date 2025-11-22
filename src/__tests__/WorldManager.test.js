import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WorldManager } from '../WorldManager.js';
import { Tree } from '../Tree.js';
import { Rock } from '../Rock.js';
import { Slime } from '../Slime.js';

describe('WorldManager', () => {
    let worldManager;
    let entityManager;
    let collidables;

    beforeEach(() => {
        entityManager = {
            add: vi.fn(),
            entities: []
        };
        collidables = [];
        worldManager = new WorldManager(entityManager, collidables);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should populate world with entities', () => {
        worldManager.populate();
        expect(entityManager.add).toHaveBeenCalled();
    });

    it('should filter entities near origin (Safe Zone)', () => {
        // Mock Math.random to control positions
        // We want to generate some positions inside the safe zone and some outside.
        // Tree safe zone: abs(x) < 3 && abs(z) < 3

        // Let's mock random to return specific sequence
        // x = (random - 0.5) * 40
        // If random = 0.5, x = 0 (Inside)

        const randomMock = vi.spyOn(Math, 'random');

        // Force ALL random calls to return 0.5 (Position 0,0)
        randomMock.mockReturnValue(0.5);

        worldManager.populate();

        // Should NOT add any entities because 0,0 is inside safe zone for all types
        expect(entityManager.add).not.toHaveBeenCalled();
    });

    it('should add entities outside safe zone', () => {
        const randomMock = vi.spyOn(Math, 'random');

        // Force random to return 0.0 -> Position -20, -20 (Outside safe zone)
        // Note: Rock scale also uses random, but that's fine.
        randomMock.mockReturnValue(0.0);

        worldManager.populate();

        // Should add entities
        // 20 Trees, 15 Rocks, 10 Slimes (based on loop counts in WorldManager)
        // Total 45 calls
        expect(entityManager.add).toHaveBeenCalledTimes(45);
    });
});
