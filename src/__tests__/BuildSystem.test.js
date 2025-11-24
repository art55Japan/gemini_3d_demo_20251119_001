// BuildSystem unit tests to achieve 100% coverage
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as THREE from 'three';
import { BuildSystem } from '../BuildSystem.js';
import { Block } from '../Block.js';

// Helper to create mock input
const mockInput = (overrides = {}) => ({
    toggleBuildMode: false,
    placeBlock: false,
    removeBlock: false,
    mouse: { x: 0, y: 0 },
    ...overrides,
});

// Minimal scene mock
const createScene = () => ({ add: vi.fn() });
// Camera mock
const createCamera = () => new THREE.PerspectiveCamera();

// Mock EntityManager with minimal behavior
class MockEntityManager {
    constructor() {
        this.entities = [];
        this.add = vi.fn((e) => this.entities.push(e));
    }
}

let collidables;

beforeEach(() => {
    vi.restoreAllMocks();
    collidables = [];
});

describe('BuildSystem', () => {
    it('initializes with ghost block hidden', () => {
        const bs = new BuildSystem(createScene(), createCamera(), new MockEntityManager(), collidables);
        expect(bs.ghostBlock.visible).toBe(false);
        expect(bs.scene.add).toHaveBeenCalledWith(bs.ghostBlock);
    });

    it('sets player correctly', () => {
        const bs = new BuildSystem(createScene(), createCamera(), new MockEntityManager(), collidables);
        const player = {};
        bs.setPlayer(player);
        expect(bs.player).toBe(player);
    });

    it('toggles build mode and updates ghost visibility', () => {
        const bs = new BuildSystem(createScene(), createCamera(), new MockEntityManager(), collidables);
        // Mock raycast to always return a ground hit so ghost stays visible
        vi.spyOn(bs, 'getRaycastHit').mockReturnValue({
            point: new THREE.Vector3(0, 0, 0),
            face: { normal: new THREE.Vector3(0, 1, 0) },
            object: { userData: {} },
        });

        // First toggle on
        bs.update(0.1, mockInput({ toggleBuildMode: true }));
        expect(bs.buildMode).toBe(true);
        expect(bs.ghostBlock.visible).toBe(true);

        // Reset cooldown to allow second toggle
        bs.buildCooldown = 0;
        // Second toggle off
        bs.update(0.1, mockInput({ toggleBuildMode: true }));
        expect(bs.buildMode).toBe(false);
        expect(bs.ghostBlock.visible).toBe(false);
    });

    it('handles cooldown correctly', () => {
        const bs = new BuildSystem(createScene(), createCamera(), new MockEntityManager(), collidables);
        bs.update(0.1, mockInput({ toggleBuildMode: true }));
        expect(bs.buildCooldown).toBeGreaterThan(0);
        const prev = bs.buildCooldown;
        bs.update(0.2, mockInput({}));
        expect(bs.buildCooldown).toBeLessThan(prev);
    });

    it('returns ground hit when no intersectables', () => {
        const bs = new BuildSystem(createScene(), createCamera(), new MockEntityManager(), collidables);
        const hit = bs.getRaycastHit(mockInput({}));
        expect(hit).toBeDefined();
        expect(hit.object.userData.type).toBe('ground');
    });

    it('places a block when input.placeBlock is true', () => {
        const scene = createScene();
        const em = new MockEntityManager();
        const bs = new BuildSystem(scene, createCamera(), em, collidables);
        bs.buildMode = true;
        const input = mockInput({ placeBlock: true, mouse: { x: 0, y: 0 } });
        vi.spyOn(bs, 'getRaycastHit').mockReturnValue({
            point: new THREE.Vector3(0, 0, 0),
            face: { normal: new THREE.Vector3(0, 1, 0) },
            object: { userData: {} },
        });
        bs.update(0.1, input);
        expect(em.add).toHaveBeenCalled();
        const added = em.entities[0];
        expect(added).toBeInstanceOf(Block);
        expect(collidables).toContain(added.mesh);
    });

    it('removes a block when input.removeBlock is true and block is removable', () => {
        const scene = createScene();
        const em = new MockEntityManager();
        const bs = new BuildSystem(scene, createCamera(), em, collidables);
        bs.buildMode = true;
        const block = new Block(0, 0, 0, 'dirt');
        em.add(block);
        collidables.push(block.mesh);
        const input = mockInput({ removeBlock: true, mouse: { x: 0, y: 0 } });
        vi.spyOn(bs, 'getRaycastHit').mockReturnValue({
            object: { userData: { entity: block } },
            point: new THREE.Vector3(0, 0, 0),
            face: { normal: new THREE.Vector3(0, 1, 0) },
        });
        bs.update(0.1, input);
        expect(block.shouldRemove).toBe(true);
        expect(collidables).not.toContain(block.mesh);
    });
});
