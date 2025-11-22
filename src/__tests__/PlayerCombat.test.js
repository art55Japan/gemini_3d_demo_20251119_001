import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PlayerCombat } from '../PlayerCombat.js';
import * as THREE from 'three';

describe('PlayerCombat', () => {
    let playerCombat;
    let player;
    let swordMesh;

    beforeEach(() => {
        swordMesh = { rotation: { x: 0 } };
        player = {
            position: new THREE.Vector3(0, 0, 0),
            mesh: {
                rotation: { y: 0 },
                getObjectByName: vi.fn(() => swordMesh)
            },
            audioManager: { playAttack: vi.fn(), playEnemyDeath: vi.fn() }
        };
        playerCombat = new PlayerCombat(player);
    });

    it('should initialize in IdleState', () => {
        expect(playerCombat.currentState.constructor.name).toBe('IdleState');
    });

    it('should transition to AttackingState on input', () => {
        const input = { attack: true };
        playerCombat.update(0.1, input, []);
        expect(playerCombat.currentState.constructor.name).toBe('AttackingState');
        expect(player.audioManager.playAttack).toHaveBeenCalled();
    });

    it('should return to IdleState after duration', () => {
        // Trigger attack
        playerCombat.update(0.1, { attack: true }, []);
        expect(playerCombat.currentState.constructor.name).toBe('AttackingState');

        // Advance time (duration is 0.4)
        // Need to call update enough times or with large delta
        playerCombat.update(0.5, { attack: false }, []);
        expect(playerCombat.currentState.constructor.name).toBe('IdleState');
    });

    it('should damage entities in range', () => {
        // Setup enemy
        const enemy = {
            position: new THREE.Vector3(0, 0, -1), // In front of player (Z is negative forward)
            takeDamage: vi.fn()
        };
        const entities = [enemy];

        // Trigger attack
        playerCombat.update(0.1, { attack: true }, entities);

        // Advance time to hit window (0.2 - 0.6)
        // Current time 0.1. Add 0.2 -> 0.3
        playerCombat.update(0.2, { attack: false }, entities);

        expect(enemy.takeDamage).toHaveBeenCalled();
    });

    it('should NOT damage entities out of range', () => {
        // Setup enemy far away
        const enemy = {
            position: new THREE.Vector3(0, 0, -10),
            takeDamage: vi.fn()
        };
        const entities = [enemy];

        // Trigger attack
        playerCombat.update(0.1, { attack: true }, entities);
        playerCombat.update(0.2, { attack: false }, entities);

        expect(enemy.takeDamage).not.toHaveBeenCalled();
    });
});
