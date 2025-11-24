import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Player } from '../Player.js';
import * as THREE from 'three';

// Mock GLTFLoader
vi.mock('three/examples/jsm/loaders/GLTFLoader.js', () => ({
    GLTFLoader: class {
        load(url, onLoad) {
            // Simulate successful load with a dummy scene
            const gltf = { scene: new THREE.Group() };
            onLoad(gltf);
        }
    }
}));

describe('Player', () => {
    let player;
    let scene;
    let audioManager;

    beforeEach(() => {
        scene = {
            add: vi.fn(),
            remove: vi.fn()
        };
        audioManager = {
            playJump: vi.fn(),
            playAttack: vi.fn()
        };
        player = new Player(scene, audioManager);
    });

    it('should initialize with position at origin', () => {
        expect(player.position.x).toBe(0);
        expect(player.position.y).toBe(0);
        expect(player.position.z).toBe(0);
    });

    it('should create mesh and add to scene', () => {
        expect(player.mesh).toBeDefined();
        expect(scene.add).toHaveBeenCalledWith(player.mesh);
    });

    it('should initialize components (physics, combat, collision)', () => {
        expect(player.physics).toBeDefined();
        expect(player.combat).toBeDefined();
        expect(player.collision).toBeDefined();
    });

    it('should not be saveable (saved separately)', () => {
        expect(player.isSaveable()).toBe(false);
    });

    it('should rotate left on input', () => {
        const input = { rotateLeft: true };
        const initialRotation = player.mesh.rotation.y;

        player.update(0.1, input, 0, [], []);

        expect(player.mesh.rotation.y).toBeGreaterThan(initialRotation);
    });

    it('should rotate right on input', () => {
        const input = { rotateRight: true };
        const initialRotation = player.mesh.rotation.y;

        player.update(0.1, input, 0, [], []);

        expect(player.mesh.rotation.y).toBeLessThan(initialRotation);
    });

    it('should call physics update', () => {
        const physicsSpy = vi.spyOn(player.physics, 'update');
        const input = {};
        const collidables = [];

        player.update(0.016, input, 0, collidables, []);

        expect(physicsSpy).toHaveBeenCalledWith(0.016, input, collidables);
    });

    it('should call combat update', () => {
        const combatSpy = vi.spyOn(player.combat, 'update');
        const input = {};
        const entities = [];

        player.update(0.016, input, 0, [], entities);

        expect(combatSpy).toHaveBeenCalledWith(0.016, input, entities);
    });

    it('should call collision check', () => {
        const collisionSpy = vi.spyOn(player.collision, 'checkCollisions');
        const entities = [];

        player.update(0.016, {}, 0, [], entities);

        expect(collisionSpy).toHaveBeenCalledWith(entities, player.physics);
    });
});
