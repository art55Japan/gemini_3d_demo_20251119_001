import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PlayerPhysics } from '../PlayerPhysics.js';
import * as THREE from 'three';

describe('PlayerPhysics', () => {
    let playerPhysics;
    let player;

    beforeEach(() => {
        player = {
            position: new THREE.Vector3(0, 0, 0),
            mesh: { position: new THREE.Vector3(0, 0, 0), rotation: { y: 0 } },
            audioManager: {
                playJump: vi.fn()
            }
        };
        playerPhysics = new PlayerPhysics(player);
    });

    describe('初期化', () => {
        it('デフォルト値で初期化される', () => {
            expect(playerPhysics.velocity).toBeDefined();
            expect(playerPhysics.velocity.x).toBe(0);
            expect(playerPhysics.velocity.y).toBe(0);
            expect(playerPhysics.velocity.z).toBe(0);
            expect(playerPhysics.knockbackVelocity).toBeDefined();
            expect(playerPhysics.onGround).toBe(true);
            expect(playerPhysics.gravity).toBe(-30.0);
            expect(playerPhysics.jumpStrength).toBe(15.0);
            expect(playerPhysics.speed).toBe(10.0);
        });
    });

    describe('reset', () => {
        it('速度とノックバックをリセット', () => {
            playerPhysics.velocity.set(5, 10, 3);
            playerPhysics.knockbackVelocity.set(2, 1, 4);
            playerPhysics.onGround = false;

            playerPhysics.reset();

            expect(playerPhysics.velocity.x).toBe(0);
            expect(playerPhysics.velocity.y).toBe(0);
            expect(playerPhysics.velocity.z).toBe(0);
            expect(playerPhysics.knockbackVelocity.x).toBe(0);
            expect(playerPhysics.knockbackVelocity.y).toBe(0);
            expect(playerPhysics.knockbackVelocity.z).toBe(0);
            expect(playerPhysics.onGround).toBe(true);
        });
    });

    describe('handleMovement', () => {
        it('入力なしで速度がゼロ', () => {
            const input = { x: 0, z: 0 };
            playerPhysics.handleMovement(0.1, input);
            expect(playerPhysics.velocity.x).toBe(0);
            expect(playerPhysics.velocity.z).toBe(0);
        });

        it('前進入力で速度が設定される', () => {
            const input = { x: 0, z: -1 };  // forward
            player.mesh.rotation.y = 0;  // 正面向き
            playerPhysics.handleMovement(0.1, input);
            expect(playerPhysics.velocity.z).toBeCloseTo(-10.0, 1);
        });

        it('後退入力で速度が設定される', () => {
            const input = { x: 0, z: 1 };  // backward
            player.mesh.rotation.y = 0;
            playerPhysics.handleMovement(0.1, input);
            expect(playerPhysics.velocity.z).toBeCloseTo(10.0, 1);
        });

        it('斜め移動が正規化される', () => {
            const input = { x: 1, z: -1 };  // 斜め
            player.mesh.rotation.y = 0;
            playerPhysics.handleMovement(0.1, input);
            const length = Math.sqrt(playerPhysics.velocity.x ** 2 + playerPhysics.velocity.z ** 2);
            expect(length).toBeCloseTo(10.0, 1);  // speed = 10.0
        });

        it('プレイヤー回転が移動方向に影響', () => {
            const input = { x: 0, z: -1 };
            player.mesh.rotation.y = Math.PI / 2;  // 90度回転
            playerPhysics.handleMovement(0.1, input);
            // 90度回転時、前進(-z)は右方向(+x)になる
            expect(Math.abs(playerPhysics.velocity.x)).toBeGreaterThan(9.0);
        });
    });

    describe('applyGravityPhysics', () => {
        it('重力が速度に加算される', () => {
            const initialY = playerPhysics.velocity.y;
            playerPhysics.applyGravityPhysics(0.1);
            expect(playerPhysics.velocity.y).toBe(initialY + playerPhysics.gravity * 0.1);
            expect(playerPhysics.velocity.y).toBeLessThan(initialY);
        });

        it('継続的に重力が適用される', () => {
            playerPhysics.applyGravityPhysics(0.1);
            const firstY = playerPhysics.velocity.y;
            playerPhysics.applyGravityPhysics(0.1);
            expect(playerPhysics.velocity.y).toBe(firstY + playerPhysics.gravity * 0.1);
        });
    });

    describe('applyKnockbackPhysics', () => {
        it('ノックバック速度が速度に加算される', () => {
            playerPhysics.knockbackVelocity.set(5, 0, 3);
            playerPhysics.applyKnockbackPhysics(0.1);
            expect(playerPhysics.velocity.x).toBe(5);
            expect(playerPhysics.velocity.z).toBe(3);
        });

        it('ノックバックが減衰する', () => {
            playerPhysics.knockbackVelocity.set(10, 0, 10);
            playerPhysics.applyKnockbackPhysics(0.1);
            expect(playerPhysics.knockbackVelocity.x).toBeCloseTo(10 * 0.9, 1);
            expect(playerPhysics.knockbackVelocity.z).toBeCloseTo(10 * 0.9, 1);
        });

        it('複数回の減衰で徐々に減少', () => {
            playerPhysics.knockbackVelocity.set(10, 0, 10);
            playerPhysics.applyKnockbackPhysics(0.1);
            const firstFrame = playerPhysics.knockbackVelocity.x;
            playerPhysics.applyKnockbackPhysics(0.1);
            expect(playerPhysics.knockbackVelocity.x).toBeCloseTo(firstFrame * 0.9, 1);
        });
    });

    describe('moveAndCollide', () => {
        it('衝突なしで移動する', () => {
            playerPhysics.velocity.set(1, 0, 1);
            playerPhysics.moveAndCollide(0.1, []);
            expect(player.position.x).toBeCloseTo(0.1, 2);
            expect(player.position.z).toBeCloseTo(0.1, 2);
        });

        it('地面に着地してonGroundがtrueになる', () => {
            player.position.set(0, 0.6, 0);
            playerPhysics.velocity.y = -10;
            playerPhysics.onGround = false;

            const blockMesh = new THREE.Mesh(
                new THREE.BoxGeometry(1, 1, 1),
                new THREE.MeshBasicMaterial()
            );
            blockMesh.position.set(0, 0, 0);
            blockMesh.geometry.boundingBox = new THREE.Box3(
                new THREE.Vector3(-0.5, -0.5, -0.5),
                new THREE.Vector3(0.5, 0.5, 0.5)
            );
            blockMesh.updateMatrixWorld();

            playerPhysics.moveAndCollide(0.05, [blockMesh]);

            expect(player.position.y).toBeCloseTo(0.5, 1);
            expect(playerPhysics.velocity.y).toBe(0);
            expect(playerPhysics.onGround).toBe(true);
        });

        it('X軸の衝突を解決', () => {
            player.position.set(0, 1, 0);
            playerPhysics.velocity.x = 2;

            const blockMesh = new THREE.Mesh(
                new THREE.BoxGeometry(1, 1, 1),
                new THREE.MeshBasicMaterial()
            );
            blockMesh.position.set(0.5, 1, 0);
            blockMesh.geometry.boundingBox = new THREE.Box3(
                new THREE.Vector3(-0.5, -0.5, -0.5),
                new THREE.Vector3(0.5, 0.5, 0.5)
            );
            blockMesh.updateMatrixWorld();

            playerPhysics.moveAndCollide(0.1, [blockMesh]);

            expect(playerPhysics.velocity.x).toBe(0);
        });

        it('Z軸の衝突を解決', () => {
            player.position.set(0, 1, 0);
            playerPhysics.velocity.z = 2;

            const blockMesh = new THREE.Mesh(
                new THREE.BoxGeometry(1, 1, 1),
                new THREE.MeshBasicMaterial()
            );
            blockMesh.position.set(0, 1, 0.5);
            blockMesh.geometry.boundingBox = new THREE.Box3(
                new THREE.Vector3(-0.5, -0.5, -0.5),
                new THREE.Vector3(0.5, 0.5, 0.5)
            );
            blockMesh.updateMatrixWorld();

            playerPhysics.moveAndCollide(0.1, [blockMesh]);

            expect(playerPhysics.velocity.z).toBe(0);
        });

        it('地面(y=0)に落下してonGroundがtrueになる', () => {
            player.position.set(0, 5, 0);
            playerPhysics.velocity.y = -10;
            playerPhysics.onGround = false;

            playerPhysics.moveAndCollide(1.0, []);

            expect(player.position.y).toBe(0);
            expect(playerPhysics.onGround).toBe(true);
        });
    });

    describe('checkCollisions', () => {
        it('衝突がない場合は空配列を返す', () => {
            const collisions = playerPhysics.checkCollisions([], 0.3, 1.0);
            expect(collisions).toEqual([]);
        });

        it('衝突するブロックを検出', () => {
            player.position.set(0, 0, 0);

            const blockMesh = new THREE.Mesh(
                new THREE.BoxGeometry(1, 1, 1),
                new THREE.MeshBasicMaterial()
            );
            blockMesh.position.set(0, 0, 0);

            const collisions = playerPhysics.checkCollisions([blockMesh], 0.3, 1.0);
            expect(collisions.length).toBe(1);
            expect(collisions[0]).toBe(blockMesh);
        });

        it('離れたブロックは検出しない', () => {
            player.position.set(0, 0, 0);

            const blockMesh = new THREE.Mesh(
                new THREE.BoxGeometry(1, 1, 1),
                new THREE.MeshBasicMaterial()
            );
            blockMesh.position.set(10, 10, 10);

            const collisions = playerPhysics.checkCollisions([blockMesh], 0.3, 1.0);
            expect(collisions.length).toBe(0);
        });

        it('collidablesがnullの場合は空配列を返す', () => {
            const collisions = playerPhysics.checkCollisions(null, 0.3, 1.0);
            expect(collisions).toEqual([]);
        });
    });

    describe('handleJump', () => {
        it('地上でジャンプ入力があればジャンプ', () => {
            playerPhysics.onGround = true;
            const input = { jump: true };

            playerPhysics.handleJump(input);

            expect(playerPhysics.velocity.y).toBe(playerPhysics.jumpStrength);
            expect(playerPhysics.onGround).toBe(false);
            expect(player.audioManager.playJump).toHaveBeenCalled();
        });

        it('空中ではジャンプしない', () => {
            playerPhysics.onGround = false;
            playerPhysics.velocity.y = 0;
            const input = { jump: true };

            playerPhysics.handleJump(input);

            expect(playerPhysics.velocity.y).toBe(0);
            expect(player.audioManager.playJump).not.toHaveBeenCalled();
        });

        it('ジャンプ入力がなければジャンプしない', () => {
            playerPhysics.onGround = true;
            playerPhysics.velocity.y = 0;
            const input = { jump: false };

            playerPhysics.handleJump(input);

            expect(playerPhysics.velocity.y).toBe(0);
            expect(player.audioManager.playJump).not.toHaveBeenCalled();
        });

        it('audioManagerがない場合でもジャンプ可能', () => {
            delete player.audioManager;
            playerPhysics.onGround = true;
            const input = { jump: true };

            playerPhysics.handleJump(input);

            expect(playerPhysics.velocity.y).toBe(playerPhysics.jumpStrength);
            expect(playerPhysics.onGround).toBe(false);
        });
    });

    describe('applyKnockback', () => {
        it('ノックバックを適用', () => {
            const direction = new THREE.Vector3(1, 0, 0).normalize();
            const strength = 5;

            playerPhysics.applyKnockback(direction, strength);

            expect(playerPhysics.knockbackVelocity.x).toBeCloseTo(5, 1);
            expect(playerPhysics.knockbackVelocity.y).toBe(0);
            expect(playerPhysics.knockbackVelocity.z).toBeCloseTo(0, 1);
            expect(playerPhysics.velocity.y).toBe(5.0);
            expect(playerPhysics.onGround).toBe(false);
        });

        it('斜めのノックバック', () => {
            const direction = new THREE.Vector3(1, 0, 1).normalize();
            const strength = 10;

            playerPhysics.applyKnockback(direction, strength);

            const length = Math.sqrt(
                playerPhysics.knockbackVelocity.x ** 2 +
                playerPhysics.knockbackVelocity.z ** 2
            );
            expect(length).toBeCloseTo(10, 1);
        });
    });

    describe('update', () => {
        it('すべての物理処理を実行', () => {
            const input = { x: 0, z: -1, jump: false };
            const delta = 0.1;
            const collidables = [];

            vi.spyOn(playerPhysics, 'handleMovement');
            vi.spyOn(playerPhysics, 'applyKnockbackPhysics');
            vi.spyOn(playerPhysics, 'applyGravityPhysics');
            vi.spyOn(playerPhysics, 'moveAndCollide');
            vi.spyOn(playerPhysics, 'handleJump');

            playerPhysics.update(delta, input, collidables);

            expect(playerPhysics.handleMovement).toHaveBeenCalledWith(delta, input);
            expect(playerPhysics.applyKnockbackPhysics).toHaveBeenCalledWith(delta);
            expect(playerPhysics.applyGravityPhysics).toHaveBeenCalledWith(delta);
            expect(playerPhysics.moveAndCollide).toHaveBeenCalledWith(delta, collidables);
            expect(playerPhysics.handleJump).toHaveBeenCalledWith(input);
        });
    });
});
