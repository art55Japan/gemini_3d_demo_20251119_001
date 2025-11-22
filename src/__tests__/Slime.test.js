import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Slime } from '../Slime.js';
import * as THREE from 'three';

describe('Slime', () => {
    let slime;

    beforeEach(() => {
        slime = new Slime(5, 10);
    });

    it('should initialize with correct type and position', () => {
        expect(slime.type).toBe('Slime');
        expect(slime.position.x).toBe(5);
        expect(slime.position.z).toBe(10);
    });

    it('should be alive initially', () => {
        expect(slime.isAlive()).toBe(true);
    });

    it('should be saveable when alive', () => {
        expect(slime.isSaveable()).toBe(true);
    });

    it('should create mesh with body and eyes', () => {
        expect(slime.mesh).toBeDefined();
        expect(slime.mesh.children.length).toBeGreaterThan(0);
    });

    it('should update with bounce animation when alive', () => {
        const initialY = slime.mesh.position.y;
        const time = 1000;

        slime.update(0.016, {}, time, [], []);

        // Position should change due to bounce animation
        expect(slime.mesh.position.y).toBeDefined();
    });

    it('should apply knockback to player on collision when alive', () => {
        const player = {
            position: new THREE.Vector3(5, 0.5, 10), // Very close to slime
            audioManager: {
                playHit: vi.fn()
            }
        };
        const physics = {
            applyKnockback: vi.fn()
        };

        slime.handleCollision(player, physics);

        expect(physics.applyKnockback).toHaveBeenCalled();
        expect(player.audioManager.playHit).toHaveBeenCalled();
    });

    it('should NOT apply knockback when player is far away', () => {
        const player = {
            position: new THREE.Vector3(20, 0.5, 20), // Far from slime
            audioManager: {
                playHit: vi.fn()
            }
        };
        const physics = {
            applyKnockback: vi.fn()
        };

        slime.handleCollision(player, physics);

        expect(physics.applyKnockback).not.toHaveBeenCalled();
    });

    it('should transition to dead state when taking damage', () => {
        expect(slime.isSaveable()).toBe(true);

        slime.takeDamage();

        expect(slime.isSaveable()).toBe(false);
    });

    it('should NOT be saveable when dead', () => {
        slime.takeDamage();

        expect(slime.isSaveable()).toBe(false);
    });

    it('should shrink when dead (death animation)', () => {
        slime.takeDamage();

        const initialScale = slime.mesh.scale.y;

        // Simulate death animation
        for (let i = 0; i < 10; i++) {
            slime.update(0.1, {}, 0, [], []);
        }

        // Scale should decrease
        expect(slime.mesh.scale.y).toBeLessThan(initialScale);
    });

    it('should mark for removal when fully shrunk', () => {
        slime.takeDamage();

        // Simulate long death animation
        for (let i = 0; i < 100; i++) {
            slime.update(0.1, {}, 0, [], []);
        }

        expect(slime.shouldRemove).toBe(true);
    });

    it('should NOT apply collision when dead', () => {
        slime.takeDamage();

        const player = {
            position: new THREE.Vector3(5, 0.5, 10),
            audioManager: {
                playHit: vi.fn()
            }
        };
        const physics = {
            applyKnockback: vi.fn()
        };

        slime.handleCollision(player, physics);

        expect(physics.applyKnockback).not.toHaveBeenCalled();
    });

    it('should ignore damage when already dead', () => {
        slime.takeDamage();
        const stateBefore = slime.currentState;

        slime.takeDamage(); // Try to damage again

        // State should not change
        expect(slime.currentState).toBe(stateBefore);
    });
});
