import * as THREE from 'three';

export class CameraManager {
    constructor(camera, player, renderer) {
        this.camera = camera;
        this.player = player;
        this.renderer = renderer;
        this.isFirstPerson = false;
        this.toggleCooldown = 0;
    }

    toggleView() {
        this.isFirstPerson = !this.isFirstPerson;
    }

    update(delta, input) {
        // Handle Toggle Input
        if (input && input.toggleView && this.toggleCooldown <= 0) {
            this.toggleView();
            this.toggleCooldown = 0.3; // Debounce
        }
        if (this.toggleCooldown > 0) this.toggleCooldown -= delta;

        // Simple camera follow for desktop
        // In VR, the camera is controlled by the headset
        if (!this.renderer.xr.isPresenting) {
            if (this.player.mesh) {
                if (this.isFirstPerson) {
                    // FPS Camera: Inside player head
                    const eyeOffset = new THREE.Vector3(0, 1.6, 0);
                    // We want to look forward based on player rotation
                    // But actually, in FPS, the camera rotation usually CONTROLS the player rotation,
                    // or follows it tightly.
                    // For this simple implementation, we'll place camera at eye level
                    // and have it look forward relative to player.

                    // Position
                    const targetPos = this.player.position.clone().add(eyeOffset);
                    this.camera.position.copy(targetPos);

                    // Rotation
                    // We need to look at where the player is facing
                    const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.player.mesh.rotation.y);
                    const lookAtPos = targetPos.clone().add(forward);
                    this.camera.lookAt(lookAtPos);

                } else {
                    // TPS Camera: Follow player rotation
                    // Offset needs to be "behind" the player.
                    // Player faces -Z (Forward). So "behind" is +Z.
                    const offset = new THREE.Vector3(0, 2.5, 4); // Up 2.5, Back 4 (Positive Z)

                    offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.player.mesh.rotation.y);

                    const targetPos = this.player.position.clone().add(offset);

                    // Smooth camera follow (optional, but nice)
                    // this.camera.position.lerp(targetPos, 0.1); 
                    // For now, direct copy to prevent lag
                    this.camera.position.copy(targetPos);

                    // Look at player head/center
                    const lookAtPos = this.player.position.clone().add(new THREE.Vector3(0, 1.5, 0));
                    this.camera.lookAt(lookAtPos);
                }
            }
        }
    }

    resize(width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }
}
