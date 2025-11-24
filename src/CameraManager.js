import * as THREE from 'three';

export class CameraManager {
    constructor(camera, player, renderer, cameraParams) {
        this.camera = camera;
        this.player = player;
        this.renderer = renderer;
        this.params = cameraParams;
        this.isFirstPerson = false;
        this.toggleCooldown = 0;

        // Orbit Camera State
        this.spherical = new THREE.Spherical(
            this.params.orbitRadius,
            this.params.initialPhi,
            this.params.initialTheta
        );
        this.target = new THREE.Vector3();
    }

    toggleView() {
        this.isFirstPerson = !this.isFirstPerson;
    }

    update(delta, input) {
        // Handle Toggle Input
        if (input && input.toggleView && this.toggleCooldown <= 0) {
            this.toggleView();
            this.toggleCooldown = this.params.toggleCooldown;
        }
        if (this.toggleCooldown > 0) this.toggleCooldown -= delta;

        // Simple camera follow for desktop
        // In VR, the camera is controlled by the headset
        if (!this.renderer.xr.isPresenting) {
            if (this.player.mesh) {
                if (this.isFirstPerson) {
                    // FPS Camera: Inside player head
                    const eyeOffset = new THREE.Vector3(0, this.params.eyeHeightOffset, 0);
                    const targetPos = this.player.position.clone().add(eyeOffset);
                    this.camera.position.copy(targetPos);

                    // Rotation: Look forward based on player rotation
                    const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.player.mesh.rotation.y);
                    const lookAtPos = targetPos.clone().add(forward);
                    this.camera.lookAt(lookAtPos);

                } else {
                    // TPS Camera: Orbit Control (Relative to Player)

                    // Keyboard Rotation (Q/E) - Adjusts camera offset angle
                    if (input) {
                        const keySensitivity = this.params.keyboardSensitivityBase * delta;
                        if (input.cameraLeft) this.spherical.theta += keySensitivity;
                        if (input.cameraRight) this.spherical.theta -= keySensitivity;
                    }

                    // Mouse Rotation (Right Drag) - Adjusts camera offset angle
                    if (input && input.removeBlock && input.mouseDelta) {
                        this.spherical.theta -= input.mouseDelta.x * this.params.mouseSensitivity;
                        this.spherical.phi -= input.mouseDelta.y * this.params.mouseSensitivity;

                        // Clamp vertical angle to avoid flipping
                        this.spherical.phi = Math.max(this.params.phiClampMin, Math.min(this.params.phiClampMax, this.spherical.phi));
                    }

                    // Calculate Camera Position
                    const lookAtTarget = this.player.position.clone().add(new THREE.Vector3(0, this.params.lookAtHeightOffset, 0));

                    // 1. Get offset from spherical coordinates (Local Offset)
                    const offset = new THREE.Vector3().setFromSpherical(this.spherical);

                    // 2. Apply Player's Rotation to this offset
                    // This ensures the camera "follows" the player's turning (A/D keys),
                    // while maintaining the custom angle set by Q/E or Mouse.
                    offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.player.mesh.rotation.y);

                    // 3. Add to target position
                    this.camera.position.copy(lookAtTarget).add(offset);
                    this.camera.lookAt(lookAtTarget);
                }
            }
        }
    }

    resize(width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }
}
