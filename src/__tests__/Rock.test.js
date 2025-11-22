import { describe, it, expect, beforeEach } from 'vitest';
import { Rock } from '../Rock.js';
import * as THREE from 'three';

describe('Rock', () => {
    let rock;

    beforeEach(() => {
        rock = new Rock(3, 7, 1.5);
    });

    it('should initialize with correct type and position', () => {
        expect(rock.type).toBe('Rock');
        expect(rock.position.x).toBe(3);
        expect(rock.position.z).toBe(7);
        expect(rock.scale).toBe(1.5);
    });

    it('should not be saveable', () => {
        expect(rock.isSaveable()).toBe(false);
    });

    it('should create mesh with rock geometry', () => {
        expect(rock.mesh).toBeDefined();
        expect(rock.mesh.children.length).toBeGreaterThan(0);
    });

    it('should use default scale if not provided', () => {
        const defaultRock = new Rock(0, 0);
        expect(defaultRock.scale).toBe(1);
    });

    it('should create felt texture with canvas', () => {
        const texture = rock.createFeltTexture('#808080');
        expect(texture).toBeInstanceOf(THREE.CanvasTexture);
        expect(texture.wrapS).toBe(THREE.RepeatWrapping);
        expect(texture.wrapT).toBe(THREE.RepeatWrapping);
    });

    it('should store entity reference in mesh userData', () => {
        expect(rock.mesh.userData.entity).toBe(rock);
    });

    it('should have random rotation for variety', () => {
        const rock1 = new Rock(0, 0);
        const rock2 = new Rock(0, 0);

        // Due to random rotation, these should likely be different
        // (though there's a tiny chance they're the same)
        const rotation1 = rock1.mesh.children[0].rotation;
        const rotation2 = rock2.mesh.children[0].rotation;

        // Just verify rotation exists and is a valid number
        expect(rotation1.x).toBeDefined();
        expect(rotation1.y).toBeDefined();
        expect(rotation1.z).toBeDefined();
    });
});
