import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PlayerCollision } from '../PlayerCollision.js';
import * as THREE from 'three';

describe('PlayerCollision', () => {
    let playerCollision;
    let player;

    beforeEach(() => {
        player = {
            position: new THREE.Vector3(0, 1, 0)
        };
        playerCollision = new PlayerCollision(player);
    });

    it('should initialize with player and raycaster', () => {
        expect(playerCollision.player).toBe(player);
        expect(playerCollision.raycaster).toBeInstanceOf(THREE.Raycaster);
        expect(playerCollision.downVector.y).toBe(-1);
    });

    it('should call handleCollision on alive entities (polymorphic)', () => {
        const mockEntity1 = {
            isAlive: () => true,
            handleCollision: vi.fn()
        };
        const mockEntity2 = {
            isAlive: () => true,
            handleCollision: vi.fn()
        };
        const physics = {};

        playerCollision.checkCollisions([mockEntity1, mockEntity2], physics);

        expect(mockEntity1.handleCollision).toHaveBeenCalledWith(player, physics);
        expect(mockEntity2.handleCollision).toHaveBeenCalledWith(player, physics);
    });

    it('should NOT call handleCollision on dead entities', () => {
        const deadEntity = {
            isAlive: () => false,
            handleCollision: vi.fn()
        };
        const physics = {};

        playerCollision.checkCollisions([deadEntity], physics);

        expect(deadEntity.handleCollision).not.toHaveBeenCalled();
    });

    it('should handle entities without isAlive method', () => {
        const entityWithoutIsAlive = {
            handleCollision: vi.fn()
        };
        const physics = {};

        // Should not crash
        expect(() => {
            playerCollision.checkCollisions([entityWithoutIsAlive], physics);
        }).not.toThrow();

        expect(entityWithoutIsAlive.handleCollision).not.toHaveBeenCalled();
    });

    it('should handle null or undefined entities array', () => {
        expect(() => {
            playerCollision.checkCollisions(null, {});
        }).not.toThrow();

        expect(() => {
            playerCollision.checkCollisions(undefined, {});
        }).not.toThrow();
    });

    it('should return ground height from raycast', () => {
        // Create a mock mesh that will be hit by raycast
        const groundMesh = new THREE.Mesh(
            new THREE.BoxGeometry(10, 1, 10),
            new THREE.MeshBasicMaterial()
        );
        groundMesh.position.set(0, -0.5, 0);
        groundMesh.updateMatrixWorld();

        const groundHeight = playerCollision.getGroundHeight([groundMesh]);

        // Should be close to 0 (top of the box)
        expect(groundHeight).toBeCloseTo(0, 1);
    });

    it('should return 0 if no ground is detected', () => {
        const groundHeight = playerCollision.getGroundHeight([]);
        expect(groundHeight).toBe(0);
    });

    it('should return 0 if collidables is null', () => {
        const groundHeight = playerCollision.getGroundHeight(null);
        expect(groundHeight).toBe(0);
    });
});
