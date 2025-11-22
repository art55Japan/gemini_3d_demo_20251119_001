import { describe, it, expect, beforeEach } from 'vitest';
import { Block } from '../Block.js';
import * as THREE from 'three';

describe('Block', () => {
    let block;

    beforeEach(() => {
        block = new Block(2, 1, 3, 'stone');
    });

    it('should initialize with correct type and position', () => {
        expect(block.type).toBe('Block');
        expect(block.blockType).toBe('stone');
        expect(block.position.x).toBe(2);
        expect(block.position.y).toBe(1);
        expect(block.position.z).toBe(3);
    });

    it('should be saveable', () => {
        expect(block.isSaveable()).toBe(true);
    });

    it('should create mesh with correct geometry', () => {
        expect(block.mesh).toBeDefined();
        expect(block.mesh.geometry).toBeInstanceOf(THREE.BoxGeometry);
    });

    it('should store entity reference in mesh userData', () => {
        expect(block.mesh.userData.entity).toBe(block);
    });

    it('should use correct color for stone', () => {
        const stoneBlock = new Block(0, 0, 0, 'stone');
        expect(stoneBlock.mesh.material.map).toBeDefined();
    });

    it('should use correct color for stone_dark', () => {
        const darkStoneBlock = new Block(0, 0, 0, 'stone_dark');
        expect(darkStoneBlock.mesh.material.map).toBeDefined();
    });

    it('should use correct color for wood', () => {
        const woodBlock = new Block(0, 0, 0, 'wood');
        expect(woodBlock.mesh.material.map).toBeDefined();
    });

    it('should use correct color for leaves', () => {
        const leavesBlock = new Block(0, 0, 0, 'leaves');
        expect(leavesBlock.mesh.material.map).toBeDefined();
    });

    it('should use default color for unknown type', () => {
        const unknownBlock = new Block(0, 0, 0, 'unknown_type');
        expect(unknownBlock.mesh.material.map).toBeDefined();
    });

    it('should create felt texture with noise', () => {
        const texture = block.createFeltTexture('#808080');
        expect(texture).toBeInstanceOf(THREE.CanvasTexture);
        expect(texture.wrapS).toBe(THREE.RepeatWrapping);
        expect(texture.wrapT).toBe(THREE.RepeatWrapping);
    });

    it('should serialize to save data correctly', () => {
        const saveData = block.toSaveData();

        expect(saveData.type).toBe('block');
        expect(saveData.x).toBe(2);
        expect(saveData.y).toBe(1);
        expect(saveData.z).toBe(3);
        expect(saveData.blockType).toBe('stone');
    });

    it('should deserialize from save data correctly', () => {
        const saveData = {
            type: 'block',
            x: 5,
            y: 10,
            z: 15,
            blockType: 'wood'
        };

        const restoredBlock = Block.fromSaveData(saveData);

        expect(restoredBlock.position.x).toBe(5);
        expect(restoredBlock.position.y).toBe(10);
        expect(restoredBlock.position.z).toBe(15);
        expect(restoredBlock.blockType).toBe('wood');
    });

    it('should have shadow casting enabled', () => {
        expect(block.mesh.castShadow).toBe(true);
        expect(block.mesh.receiveShadow).toBe(true);
    });

    it('should position mesh correctly', () => {
        expect(block.mesh.position.x).toBe(2);
        expect(block.mesh.position.y).toBe(1);
        expect(block.mesh.position.z).toBe(3);
    });
});
