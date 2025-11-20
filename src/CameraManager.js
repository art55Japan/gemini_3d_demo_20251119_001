import * as THREE from 'three';

export class CameraManager {
    constructor(camera, player, renderer) {
        this.camera = camera;
        this.player = player;
        this.renderer = renderer;
    }

    update(delta) {
        // Simple camera follow for desktop
        // In VR, the camera is controlled by the headset
        if (!this.renderer.xr.isPresenting) {
            // TPS Camera: Follow player rotation
            // Offset needs to be "behind" the player.
            // Player faces +Z (at rot 0). So "behind" is -Z.
            const offset = new THREE.Vector3(0, 2.5, -4); // Up 2.5, Back 4 (Negative Z)

            // Ensure player mesh exists before accessing rotation
            if (this.player.mesh) {
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

    resize(width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }
}
