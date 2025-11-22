import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PlayerPhysics } from '../PlayerPhysics.js';
import * as THREE from 'three';

describe('PlayerPhysics', () => {
    let playerPhysics;
    let player;

    beforeEach(() => {
        player = {
            position: new THREE.Vector3(0, 0, 0),
            mesh: { position: new THREE.Vector3(0, 0, 0), rotation: { y: 0 } }
        };
        playerPhysics = new PlayerPhysics(player);
    });

    it('should initialize with default values', () => {
        expect(playerPhysics.velocity).toBeDefined();
        expect(playerPhysics.onGround).toBe(true);
    });

    it('should apply gravity', () => {
        const initialY = playerPhysics.velocity.y;
        playerPhysics.applyGravityPhysics(0.1);
        expect(playerPhysics.velocity.y).toBeLessThan(initialY);
    });

    it('should resolve collision on Y axis (Ground)', () => {
        // Setup player falling onto a block
        // Block top at 0.5 (center 0, size 1)
        // Player radius 0.3 (default in moveAndCollide) -> height 1.0 (default)

        // Place player ABOVE block top so wasAbove check passes
        // Block Top = 0.5
        player.position.set(0, 0.6, 0);
        playerPhysics.velocity.y = -10;

        // Create a block at (0, 0, 0) size 1x1x1
        const blockMesh = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.MeshBasicMaterial()
        );
        blockMesh.position.set(0, 0, 0);

        // Manually setup geometry bounding box for Box3
        blockMesh.geometry.boundingBox = new THREE.Box3(
            new THREE.Vector3(-0.5, -0.5, -0.5),
            new THREE.Vector3(0.5, 0.5, 0.5)
        );
        blockMesh.updateMatrixWorld();

        const collidables = [blockMesh];

        // Move Y using moveAndCollide
        // Delta enough to penetrate: 0.6 + (-10 * 0.05) = 0.1 (below 0.5)
        playerPhysics.moveAndCollide(0.05, collidables);

        // Should be pushed up
        // Target Y = Block Top (0.5)
        // moveAndCollide sets position.y = block.position.y + 0.5
        expect(player.position.y).toBeCloseTo(0.5);
        expect(playerPhysics.velocity.y).toBe(0); // Velocity reset on collision
        expect(playerPhysics.onGround).toBe(true);
    });
});
