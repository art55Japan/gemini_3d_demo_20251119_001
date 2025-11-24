/**
 * Camera Parameters
 * すべてのカメラ関連のパラメータを定義
 * このファイルのパラメータ値は、既存の実装から抽出した値を保持しています
 */
export class CameraParameters {
    constructor({
        orbitRadius = 4,
        initialPhi = Math.PI / 3,
        initialTheta = 0,
        mouseSensitivity = 0.005,
        keyboardSensitivityBase = 2.0,
        phiClampMin = 0.1,
        phiClampMax = Math.PI - 0.1,
        lookAtHeightOffset = 1.5,
        eyeHeightOffset = 1.6,
        toggleCooldown = 0.3
    } = {}) {
        this.orbitRadius = orbitRadius;
        this.initialPhi = initialPhi;
        this.initialTheta = initialTheta;
        this.mouseSensitivity = mouseSensitivity;
        this.keyboardSensitivityBase = keyboardSensitivityBase;
        this.phiClampMin = phiClampMin;
        this.phiClampMax = phiClampMax;
        this.lookAtHeightOffset = lookAtHeightOffset;
        this.eyeHeightOffset = eyeHeightOffset;
        this.toggleCooldown = toggleCooldown;
        Object.freeze(this);
    }
}
