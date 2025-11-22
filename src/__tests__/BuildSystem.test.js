import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BuildSystem } from '../BuildSystem.js';
import { Block } from '../Block.js';
import * as THREE from 'three';

describe('BuildSystem', () => {
    let buildSystem;
    let entityManager;
    let collidables;

    beforeEach(() => {
        entityManager = { add: vi.fn() };
        collidables = [];
        const scene = { add: vi.fn() };
        const camera = {};
        buildSystem = new BuildSystem(scene, camera, entityManager, collidables);
    });

    it('should remove block from collidables by reference', () => {
        const block = new Block(0, 0, 0, 'dirt');
        collidables.push(block.mesh);

        buildSystem.removeBlock(block);

        expect(collidables).toHaveLength(0);
        expect(block.shouldRemove).toBe(true);
    });

    it('should remove block from collidables by UUID fallback', () => {
        const block = new Block(0, 0, 0, 'dirt');

        // Create a fake mesh with same UUID to simulate reference mismatch
        const fakeMesh = { uuid: block.mesh.uuid };

        // Add fake mesh to collidables
        collidables.push(fakeMesh);

        // Calling removeBlock(block) will fail indexOf check (block.mesh !== fakeMesh)
        // But should pass findIndex check (block.mesh.uuid === fakeMesh.uuid)

        buildSystem.removeBlock(block);

        expect(collidables).toHaveLength(0);
    });
});
