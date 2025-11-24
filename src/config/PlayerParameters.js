/**
 * Player Parameters
 * すべてのプレイヤーモデル関連のパラメータを定義
 * このファイルのパラメータ値は、既存の実装から抽出した値を保持しています
 */
export class PlayerParameters {
    constructor({
        targetHeight = 1.5,
        initialRotationY = Math.PI / 2
    } = {}) {
        this.targetHeight = targetHeight;
        this.initialRotationY = initialRotationY;
        Object.freeze(this);
    }
}
