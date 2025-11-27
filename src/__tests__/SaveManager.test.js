// SaveManager unit tests to increase coverage
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SaveManager } from '../SaveManager.js';
import { Block } from '../Block.js';
import { Slime } from '../Slime.js';

// Helper to create a mock game environment
const createMockGame = () => {
    const player = {
        position: { toArray: () => [1, 2, 3], fromArray: vi.fn(), x: 0, z: 0 },
        mesh: { rotation: { y: 0 } },
        physics: { velocity: { set: vi.fn() }, onGround: false },
    };
    const entityManager = { entities: [], add: vi.fn((e) => entityManager.entities.push(e)), remove: vi.fn() };
    const collidables = [];
    const notificationManager = { show: vi.fn() };
    return { player, entityManager, collidables, notificationManager };
};

// Mock localStorage using vi.stubGlobal
const setupLocalStorage = () => {
    const storage = {};
    vi.stubGlobal('localStorage', {
        getItem: vi.fn((key) => (key in storage ? storage[key] : null)),
        setItem: vi.fn((key, value) => { storage[key] = value; }),
        removeItem: vi.fn((key) => { delete storage[key]; }),
        key: vi.fn((i) => Object.keys(storage)[i] || null),
        get length() { return Object.keys(storage).length; },
    });
    return storage;
};

beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    setupLocalStorage();
});

describe('SaveManager', () => {
    it('quickSave stores data in localStorage', () => {
        const game = createMockGame();
        const sm = new SaveManager(game);
        sm.quickSave();
        expect(localStorage.setItem).toHaveBeenCalled();
        expect(game.notificationManager.show).toHaveBeenCalledWith('Quick Save Successful!');
    });

    it('quickLoad restores player state', () => {
        const game = createMockGame();
        const sm = new SaveManager(game);
        const saveData = {
            timestamp: Date.now(),
            summary: 'test',
            player: { position: [10, 20, 30], rotation: 1.5 },
            blocks: [],
            enemies: [],
        };
        localStorage.getItem = vi.fn(() => JSON.stringify(saveData));
        sm.quickLoad();
        expect(game.player.position.fromArray).toHaveBeenCalledWith([10, 20, 30]);
        expect(game.player.mesh.rotation.y).toBe(1.5);
        expect(game.notificationManager.show).toHaveBeenCalledWith('Quick Load Successful!');
    });

    it('getSlots returns sorted save slots', () => {
        const game = createMockGame();
        const sm = new SaveManager(game);
        const now = Date.now();
        const slot1 = { timestamp: now, summary: 'first' };
        const slot2 = { timestamp: now + 1000, summary: 'second' };

        const storage = {
            [sm.prefix + '1']: JSON.stringify(slot1),
            [sm.prefix + '2']: JSON.stringify(slot2),
        };

        localStorage.getItem = vi.fn((key) => storage[key] || null);
        localStorage.key = vi.fn((i) => Object.keys(storage)[i] || null);
        Object.defineProperty(localStorage, 'length', {
            get: () => Object.keys(storage).length,
            configurable: true
        });

        const slots = sm.getSlots();
        expect(slots.length).toBe(2);
        expect(slots[0].id).toBe('2'); // newest first
        expect(slots[1].id).toBe('1');
    });

    it('save creates a slot with player position summary', () => {
        const game = createMockGame();
        game.player.position.x = 5;
        game.player.position.z = 7;
        const sm = new SaveManager(game);
        const result = sm.save('testSlot');
        expect(result).toBe(true);
        expect(localStorage.setItem).toHaveBeenCalled();
        expect(game.notificationManager.show).toHaveBeenCalled();
    });

    it('load restores saved blocks and enemies', () => {
        const game = createMockGame();
        const sm = new SaveManager(game);
        const blockData = { type: 'block', x: 0, y: 0, z: 0, texture: 'dirt' };
        const slimeData = { type: 'slime', x: 1, y: 0, z: 1 };
        const saveData = {
            timestamp: Date.now(),
            summary: 'test',
            player: { position: [0, 0, 0], rotation: 0 },
            blocks: [blockData],
            enemies: [slimeData],
        };

        localStorage.getItem = vi.fn(() => JSON.stringify(saveData));
        vi.spyOn(Block, 'fromSaveData').mockImplementation((d) => ({ ...d, mesh: {} }));
        vi.spyOn(Slime, 'fromSaveData').mockImplementation((d) => ({ ...d }));

        const result = sm.load('slotA');
        expect(result).toBe(true);
        expect(Block.fromSaveData).toHaveBeenCalledWith(blockData);
        expect(Slime.fromSaveData).toHaveBeenCalledWith(slimeData);
        expect(game.entityManager.entities.length).toBe(2);
        expect(game.collidables).toContain(game.entityManager.entities[0].mesh);
        expect(game.notificationManager.show).toHaveBeenCalled();
    });

    it('delete removes a slot', () => {
        const game = createMockGame();
        const sm = new SaveManager(game);
        localStorage.getItem = vi.fn(() => JSON.stringify({}));
        sm.delete('delMe');
        expect(localStorage.removeItem).toHaveBeenCalled();
        expect(game.notificationManager.show).toHaveBeenCalled();
    });
});
