import { describe, it, expect } from 'vitest';
import { Entity } from '../Entity.js';
import { Block } from '../Block.js';
import { Slime } from '../Slime.js';
import * as THREE from 'three';

describe('Entity System', () => {
    describe('Entity Base', () => {
        it('should initialize with default values', () => {
            const entity = new Entity();
            expect(entity.shouldRemove).toBe(false);
            expect(entity.position).toBeDefined();
        });
    });

    describe('Block', () => {
        it('should be saveable', () => {
            const block = new Block(0, 0, 0, 'dirt');
            expect(block.isSaveable()).toBe(true);
        });

        it('should serialize correctly', () => {
            const block = new Block(1, 2, 3, 'stone');
            const data = block.toSaveData();
            expect(data).toEqual({
                type: 'block',
                x: 1,
                y: 2,
                z: 3,
                blockType: 'stone'
            });
        });

        it('should deserialize correctly', () => {
            const data = { x: 10, y: 20, z: 30, blockType: 'wood' };
            const block = Block.fromSaveData(data);
            expect(block.position.x).toBe(10);
            expect(block.position.y).toBe(20);
            expect(block.position.z).toBe(30);
            expect(block.blockType).toBe('wood');
            expect(block.mesh).toBeDefined();
        });
    });

    describe('Slime', () => {
        it('should be saveable when alive', () => {
            const slime = new Slime(0, 0);
            expect(slime.isSaveable()).toBe(true);
        });

        it('should not be saveable when dead', () => {
            const slime = new Slime(0, 0);
            slime.takeDamage();
            expect(slime.isSaveable()).toBe(false);
        });

        it('should serialize correctly', () => {
            const slime = new Slime(5, 5);
            const data = slime.toSaveData();
            expect(data).toEqual({
                type: 'slime',
                x: 5,
                z: 5
            });
        });
    });
});
