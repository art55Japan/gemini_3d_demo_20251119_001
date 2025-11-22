import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EntityManager } from '../EntityManager.js';
import * as THREE from 'three';

describe('EntityManager', () => {
    let entityManager;
    let scene;

    beforeEach(() => {
        scene = {
            add: vi.fn(),
            remove: vi.fn()
        };
        entityManager = new EntityManager(scene);
    });

    it('should initialize with empty entities array', () => {
        expect(entityManager.entities).toEqual([]);
        expect(entityManager.scene).toBe(scene);
    });

    it('should add entity to array and scene', () => {
        const mockMesh = { type: 'Mesh' };
        const entity = {
            type: 'TestEntity',
            mesh: mockMesh
        };

        entityManager.add(entity);

        expect(entityManager.entities).toContain(entity);
        expect(scene.add).toHaveBeenCalledWith(mockMesh);
    });

    it('should add entity without mesh (no scene.add)', () => {
        const entity = {
            type: 'TestEntity'
            // No mesh
        };

        entityManager.add(entity);

        expect(entityManager.entities).toContain(entity);
        expect(scene.add).not.toHaveBeenCalled();
    });

    it('should remove entity from array and scene', () => {
        const mockMesh = { type: 'Mesh' };
        const entity = {
            type: 'TestEntity',
            mesh: mockMesh
        };

        entityManager.add(entity);
        entityManager.remove(entity);

        expect(entityManager.entities).not.toContain(entity);
        expect(scene.remove).toHaveBeenCalledWith(mockMesh);
    });

    it('should handle removing non-existent entity gracefully', () => {
        const entity = {
            type: 'TestEntity',
            mesh: {}
        };

        expect(() => {
            entityManager.remove(entity);
        }).not.toThrow();

        expect(scene.remove).not.toHaveBeenCalled();
    });

    it('should call update on entities that have update method', () => {
        const entity1 = {
            update: vi.fn()
        };
        const entity2 = {
            update: vi.fn()
        };
        const entity3 = {
            // No update method
        };

        entityManager.add(entity1);
        entityManager.add(entity2);
        entityManager.add(entity3);

        const delta = 0.016;
        const input = {};
        const time = 1000;
        const collidables = [];

        entityManager.update(delta, input, time, collidables);

        expect(entity1.update).toHaveBeenCalledWith(delta, input, time, collidables, entityManager.entities);
        expect(entity2.update).toHaveBeenCalledWith(delta, input, time, collidables, entityManager.entities);
    });

    it('should remove entities marked with shouldRemove during update', () => {
        const entityToRemove = {
            shouldRemove: true,
            mesh: {},
            update: vi.fn()
        };
        const entityToKeep = {
            shouldRemove: false,
            mesh: {},
            update: vi.fn()
        };

        entityManager.add(entityToRemove);
        entityManager.add(entityToKeep);

        entityManager.update(0.016, {}, 0, []);

        expect(entityManager.entities).not.toContain(entityToRemove);
        expect(entityManager.entities).toContain(entityToKeep);
    });
});
