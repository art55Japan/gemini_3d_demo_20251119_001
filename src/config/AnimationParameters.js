/**
 * Animation Parameters
 * すべてのアニメーション関連のパラメータを定義
 * このファイルのパラメータ値は、既存の実装から抽出した値を保持しています
 */
export class AnimationParameters {
    constructor({
        speedThreshold = 0.05,
        timeMultiplier = 8,
        bobAmount = 0.2,
        tiltAmount = 0.1,
        lerpFactor = 0.1
    } = {}) {
        this.speedThreshold = speedThreshold;
        this.timeMultiplier = timeMultiplier;
        this.bobAmount = bobAmount;
        this.tiltAmount = tiltAmount;
        this.lerpFactor = lerpFactor;
        Object.freeze(this);
    }
}
