import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CameraManager } from '../CameraManager.js';
import * as THREE from 'three';
import { CameraParameters } from '../config/CameraParameters.js';

describe('CameraManager', () => {
    let cameraManager;
    let camera;
    let player;
    let renderer;

    beforeEach(() => {
        camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        camera.position.set(0, 5, 10);

        player = {
            position: new THREE.Vector3(0, 0, 0),
            mesh: {
                rotation: { y: 0 }
            }
        };

        renderer = {
            xr: {
                isPresenting: false
            }
        };

        const cameraParams = new CameraParameters();
        cameraManager = new CameraManager(camera, player, renderer, cameraParams);
    });

    it('should initialize with default TPS view', () => {
        expect(cameraManager.isFirstPerson).toBe(false);
        expect(cameraManager.toggleCooldown).toBe(0);
    });

    it('should toggle view when toggleView is called', () => {
        expect(cameraManager.isFirstPerson).toBe(false);

        cameraManager.toggleView();
        expect(cameraManager.isFirstPerson).toBe(true);

        cameraManager.toggleView();
        expect(cameraManager.isFirstPerson).toBe(false);
    });

    it('should handle toggle input with cooldown', () => {
        const input = { toggleView: true };

        cameraManager.update(0.016, input);
        expect(cameraManager.isFirstPerson).toBe(true);
        expect(cameraManager.toggleCooldown).toBeGreaterThan(0);
    });

    it('should prevent rapid toggling with cooldown', () => {
        const input = { toggleView: true };

        // First toggle
        cameraManager.update(0.016, input);
        expect(cameraManager.isFirstPerson).toBe(true);

        // Second toggle (should be blocked by cooldown)
        cameraManager.update(0.016, input);
        expect(cameraManager.isFirstPerson).toBe(true); // Still FPS
    });

    it('should decrease cooldown over time', () => {
        const input = { toggleView: true };
        cameraManager.update(0.016, input);

        const initialCooldown = cameraManager.toggleCooldown;
        cameraManager.update(0.1, {});

        expect(cameraManager.toggleCooldown).toBeLessThan(initialCooldown);
    });

    it('should position camera in TPS mode', () => {
        const input = {};
        cameraManager.isFirstPerson = false;

        cameraManager.update(0.016, input);

        // Camera should be behind and above player
        expect(camera.position.y).toBeGreaterThan(player.position.y);
        expect(camera.position.z).toBeGreaterThan(player.position.z);
    });

    it('should position camera in FPS mode', () => {
        const input = {};
        cameraManager.isFirstPerson = true;

        cameraManager.update(0.016, input);

        // Camera should be at player eye level
        expect(camera.position.x).toBeCloseTo(player.position.x, 1);
        expect(camera.position.y).toBeCloseTo(1.6, 1); // Eye height
        expect(camera.position.z).toBeCloseTo(player.position.z, 1);
    });

    it('should not update camera when in VR mode', () => {
        renderer.xr.isPresenting = true;
        const initialPos = camera.position.clone();

        cameraManager.update(0.016, {});

        // Camera position should not change in VR
        expect(camera.position.x).toBe(initialPos.x);
        expect(camera.position.y).toBe(initialPos.y);
        expect(camera.position.z).toBe(initialPos.z);
    });

    it('should resize camera aspect ratio', () => {
        cameraManager.resize(1920, 1080);
        expect(camera.aspect).toBeCloseTo(1920 / 1080, 5);
    });
});
