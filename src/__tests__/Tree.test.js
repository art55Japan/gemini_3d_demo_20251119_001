import { describe, it, expect, beforeEach } from 'vitest';
import { Tree } from '../Tree.js';
import * as THREE from 'three';

describe('Tree', () => {
    let tree;

    beforeEach(() => {
        tree = new Tree(5, 10);
    });

    it('should initialize with correct type and position', () => {
        expect(tree.type).toBe('Tree');
        expect(tree.position.x).toBe(5);
        expect(tree.position.z).toBe(10);
    });

    it('should not be saveable', () => {
        expect(tree.isSaveable()).toBe(false);
    });

    it('should create mesh with trunk and leaves', () => {
        expect(tree.mesh).toBeDefined();
        expect(tree.mesh.children.length).toBe(2); // Trunk + Leaves
    });

    it('should push player away on collision', () => {
        const player = {
            position: new THREE.Vector3(5.2, 0, 10) // Close to tree
        };
        const physics = {}; // Not used in Tree collision

        const initialX = player.position.x;

        tree.handleCollision(player, physics);

        // Player should be pushed away (X should increase since player is to the right)
        expect(player.position.x).toBeGreaterThan(initialX);
    });

    it('should NOT push player if too far away', () => {
        const player = {
            position: new THREE.Vector3(10, 0, 10) // Far from tree
        };
        const physics = {};

        const initialX = player.position.x;

        tree.handleCollision(player, physics);

        // Player should NOT move (no collision)
        expect(player.position.x).toBe(initialX);
    });

    it('should NOT push player if above tree height', () => {
        const player = {
            position: new THREE.Vector3(5, 15, 10) // High above tree
        };
        const physics = {};

        const initialX = player.position.x;

        tree.handleCollision(player, physics);

        // Player should NOT move (above tree)
        expect(player.position.x).toBe(initialX);
    });

    it('should store entity reference in mesh userData', () => {
        expect(tree.mesh.userData.entity).toBe(tree);
    });
});
