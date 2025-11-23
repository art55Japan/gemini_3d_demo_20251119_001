import { describe, it, expect, beforeEach } from 'vitest';
import { Entity } from '../Entity.js';
import * as THREE from 'three';

describe('Entity', () => {
    let entity;

    beforeEach(() => {
        entity = new Entity();
    });

    describe('初期化', () => {
        it('デフォルト値で初期化される', () => {
            expect(entity.type).toBe('Entity');
            expect(entity.mesh).toBeNull();
            expect(entity._position).toBeInstanceOf(THREE.Vector3);
            expect(entity._position.x).toBe(0);
            expect(entity._position.y).toBe(0);
            expect(entity._position.z).toBe(0);
            expect(entity.shouldRemove).toBe(false);
        });
    });

    describe('position getter/setter', () => {
        it('position getterが内部位置を返す', () => {
            entity._position.set(1, 2, 3);
            const pos = entity.position;
            expect(pos.x).toBe(1);
            expect(pos.y).toBe(2);
            expect(pos.z).toBe(3);
        });

        it('position setterが内部位置を更新', () => {
            const newPos = new THREE.Vector3(5, 10, 15);
            entity.position = newPos;
            expect(entity._position.x).toBe(5);
            expect(entity._position.y).toBe(10);
            expect(entity._position.z).toBe(15);
        });

        it('meshがある場合、position setterがmesh.positionも更新', () => {
            entity.mesh = new THREE.Mesh();
            const newPos = new THREE.Vector3(7, 8, 9);
            entity.position = newPos;
            expect(entity.mesh.position.x).toBe(7);
            expect(entity.mesh.position.y).toBe(8);
            expect(entity.mesh.position.z).toBe(9);
        });

        it('meshがない場合でもposition setterが問題なく動作', () => {
            entity.mesh = null;
            const newPos = new THREE.Vector3(1, 1, 1);
            expect(() => {
                entity.position = newPos;
            }).not.toThrow();
            expect(entity._position.x).toBe(1);
        });
    });

    describe('update', () => {
        it('デフォルトのupdateは何もしない', () => {
            expect(() => {
                entity.update(0.1, {}, 0, [], []);
            }).not.toThrow();
        });

        it('updateは各種引数を受け取れる', () => {
            const delta = 0.016;
            const input = { x: 0, z: 0 };
            const time = 1000;
            const collidables = [];
            const entities = [];

            expect(() => {
                entity.update(delta, input, time, collidables, entities);
            }).not.toThrow();
        });
    });

    describe('handleCollision', () => {
        it('デフォルトのhandleCollisionは何もしない', () => {
            const player = {};
            const physics = {};
            expect(() => {
                entity.handleCollision(player, physics);
            }).not.toThrow();
        });
    });

    describe('isAlive', () => {
        it('shouldRemoveがfalseの場合trueを返す', () => {
            entity.shouldRemove = false;
            expect(entity.isAlive()).toBe(true);
        });

        it('shouldRemoveがtrueの場合falseを返す', () => {
            entity.shouldRemove = true;
            expect(entity.isAlive()).toBe(false);
        });
    });

    describe('isSaveable', () => {
        it('デフォルトでfalseを返す', () => {
            expect(entity.isSaveable()).toBe(false);
        });
    });

    describe('toSaveData', () => {
        it('デフォルトでnullを返す', () => {
            expect(entity.toSaveData()).toBeNull();
        });
    });

    describe('fromSaveData', () => {
        it('デフォルトでnullを返す', () => {
            const data = { type: 'test', x: 1, y: 2, z: 3 };
            expect(Entity.fromSaveData(data)).toBeNull();
        });
    });

    describe('継承とオーバーライド', () => {
        class SaveableEntity extends Entity {
            constructor() {
                super();
                this.type = 'SaveableEntity';
            }

            isSaveable() {
                return true;
            }

            toSaveData() {
                return {
                    type: this.type,
                    x: this.position.x,
                    y: this.position.y,
                    z: this.position.z
                };
            }

            static fromSaveData(data) {
                const entity = new SaveableEntity();
                entity.position = new THREE.Vector3(data.x, data.y, data.z);
                return entity;
            }
        }

        it('サブクラスがisSaveableをオーバーライド可能', () => {
            const saveable = new SaveableEntity();
            expect(saveable.isSaveable()).toBe(true);
        });

        it('サブクラスがtoSaveDataをオーバーライド可能', () => {
            const saveable = new SaveableEntity();
            saveable.position = new THREE.Vector3(10, 20, 30);
            const data = saveable.toSaveData();
            expect(data.type).toBe('SaveableEntity');
            expect(data.x).toBe(10);
            expect(data.y).toBe(20);
            expect(data.z).toBe(30);
        });

        it('サブクラスがfromSaveDataをオーバーライド可能', () => {
            const data = { type: 'SaveableEntity', x: 5, y: 15, z: 25 };
            const restored = SaveableEntity.fromSaveData(data);
            expect(restored).toBeInstanceOf(SaveableEntity);
            expect(restored.position.x).toBe(5);
            expect(restored.position.y).toBe(15);
            expect(restored.position.z).toBe(25);
        });
    });

    describe('mesh同期', () => {
        it('meshが設定されている場合、位置変更が同期される', () => {
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshBasicMaterial();
            entity.mesh = new THREE.Mesh(geometry, material);

            entity.position = new THREE.Vector3(3, 7, 11);

            expect(entity.mesh.position.x).toBe(3);
            expect(entity.mesh.position.y).toBe(7);
            expect(entity.mesh.position.z).toBe(11);
        });

        it('meshがnullでも位置設定は動作', () => {
            entity.mesh = null;
            expect(() => {
                entity.position = new THREE.Vector3(100, 200, 300);
            }).not.toThrow();
            expect(entity._position.x).toBe(100);
            expect(entity._position.y).toBe(200);
            expect(entity._position.z).toBe(300);
        });
    });

    describe('エッジケース', () => {
        it('shouldRemoveを複数回切り替え可能', () => {
            expect(entity.isAlive()).toBe(true);
            entity.shouldRemove = true;
            expect(entity.isAlive()).toBe(false);
            entity.shouldRemove = false;
            expect(entity.isAlive()).toBe(true);
        });

        it('位置を複数回変更可能', () => {
            entity.position = new THREE.Vector3(1, 1, 1);
            expect(entity._position.x).toBe(1);
            entity.position = new THREE.Vector3(2, 2, 2);
            expect(entity._position.x).toBe(2);
            entity.position = new THREE.Vector3(3, 3, 3);
            expect(entity._position.x).toBe(3);
        });
    });
});
