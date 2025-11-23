import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Input } from '../Input.js';

describe('Input', () => {
    let input;
    let renderer;

    beforeEach(() => {
        renderer = {
            xr: {
                getSession: vi.fn(() => null)
            }
        };
        input = new Input(renderer);
    });

    describe('キーマッピング', () => {
        it('前進キー (w, ArrowUp, Up) が forward にマッピングされる', () => {
            ['w', 'ArrowUp', 'Up'].forEach(key => {
                const testInput = new Input(renderer);
                window.dispatchEvent(new KeyboardEvent('keydown', { key }));
                expect(testInput.activeKeys.has('forward')).toBe(true);
            });
        });

        it('後退キー (s, ArrowDown, Down) が backward にマッピングされる', () => {
            ['s', 'ArrowDown', 'Down'].forEach(key => {
                const testInput = new Input(renderer);
                window.dispatchEvent(new KeyboardEvent('keydown', { key }));
                expect(testInput.activeKeys.has('backward')).toBe(true);
            });
        });

        it('左回転キー (a, ArrowLeft, Left) が rotateLeft にマッピングされる', () => {
            ['a', 'ArrowLeft', 'Left'].forEach(key => {
                const testInput = new Input(renderer);
                window.dispatchEvent(new KeyboardEvent('keydown', { key }));
                expect(testInput.activeKeys.has('rotateLeft')).toBe(true);
            });
        });

        it('右回転キー (d, ArrowRight, Right) が rotateRight にマッピングされる', () => {
            ['d', 'ArrowRight', 'Right'].forEach(key => {
                const testInput = new Input(renderer);
                window.dispatchEvent(new KeyboardEvent('keydown', { key }));
                expect(testInput.activeKeys.has('rotateRight')).toBe(true);
            });
        });

        it('スペースキーが jump にマッピングされる', () => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
            expect(input.activeKeys.has('jump')).toBe(true);
        });

        it('fキーが attack にマッピングされる', () => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'f' }));
            expect(input.activeKeys.has('attack')).toBe(true);
        });

        it('bキーが toggleBuildMode にマッピングされる', () => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'b' }));
            expect(input.activeKeys.has('toggleBuildMode')).toBe(true);
        });

        it('vキーが toggleView にマッピングされる', () => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'v' }));
            expect(input.activeKeys.has('toggleView')).toBe(true);
        });

        it('kキーが save にマッピングされる', () => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k' }));
            expect(input.activeKeys.has('save')).toBe(true);
        });

        it('lキーが load にマッピングされる', () => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'l' }));
            expect(input.activeKeys.has('load')).toBe(true);
        });

        it('mキーが menu にマッピングされる', () => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'm' }));
            expect(input.activeKeys.has('menu')).toBe(true);
        });

        it('keyup で activeKeys から削除される', () => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }));
            expect(input.activeKeys.has('forward')).toBe(true);
            window.dispatchEvent(new KeyboardEvent('keyup', { key: 'w' }));
            expect(input.activeKeys.has('forward')).toBe(false);
        });

        it('マップされていないキーは無視される', () => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'z' }));
            expect(input.activeKeys.size).toBe(0);
        });
    });

    describe('マウス入力', () => {
        it('左クリックで mouseDown が true になる', () => {
            window.dispatchEvent(new MouseEvent('mousedown', { button: 0 }));
            expect(input.mouseDown).toBe(true);
        });

        it('左クリック解除で mouseDown が false になる', () => {
            window.dispatchEvent(new MouseEvent('mousedown', { button: 0 }));
            window.dispatchEvent(new MouseEvent('mouseup', { button: 0 }));
            expect(input.mouseDown).toBe(false);
        });

        it('右クリックで rightMouseDown が true になる', () => {
            window.dispatchEvent(new MouseEvent('mousedown', { button: 2 }));
            expect(input.rightMouseDown).toBe(true);
        });

        it('右クリック解除で rightMouseDown が false になる', () => {
            window.dispatchEvent(new MouseEvent('mousedown', { button: 2 }));
            window.dispatchEvent(new MouseEvent('mouseup', { button: 2 }));
            expect(input.rightMouseDown).toBe(false);
        });

        it('マウス移動で座標が更新される', () => {
            // ウィンドウサイズをモック
            vi.stubGlobal('innerWidth', 1000);
            vi.stubGlobal('innerHeight', 800);

            window.dispatchEvent(new MouseEvent('mousemove', {
                clientX: 500,  // 中央
                clientY: 400   // 中央
            }));

            expect(input.mouse.x).toBe(0);  // (500/1000) * 2 - 1 = 0
            expect(input.mouse.y).toBe(0);  // -(400/800) * 2 + 1 = 0
        });
    });

    describe('getState', () => {
        it('デフォルト状態を返す', () => {
            const state = input.getState();
            expect(state.x).toBe(0);
            expect(state.z).toBe(0);
            expect(state.jump).toBe(false);
            expect(state.attack).toBe(false);
            expect(state.rotateLeft).toBe(false);
            expect(state.rotateRight).toBe(false);
            expect(state.toggleBuildMode).toBe(false);
            expect(state.toggleView).toBe(false);
            expect(state.placeBlock).toBe(false);
            expect(state.removeBlock).toBe(false);
            expect(state.save).toBe(false);
            expect(state.load).toBe(false);
            expect(state.menu).toBe(false);
            expect(state.mouse).toBeDefined();
        });

        it('前進入力で z = -1', () => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }));
            const state = input.getState();
            expect(state.z).toBe(-1);
        });

        it('後退入力で z = 1', () => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 's' }));
            const state = input.getState();
            expect(state.z).toBe(1);
        });

        it('左クリックで attack と placeBlock が true', () => {
            window.dispatchEvent(new MouseEvent('mousedown', { button: 0 }));
            const state = input.getState();
            expect(state.attack).toBe(true);
            expect(state.placeBlock).toBe(true);
        });

        it('右クリックで removeBlock が true', () => {
            window.dispatchEvent(new MouseEvent('mousedown', { button: 2 }));
            const state = input.getState();
            expect(state.removeBlock).toBe(true);
        });

        it('複数キー入力を正しく処理', () => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }));
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
            window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));

            const state = input.getState();
            expect(state.z).toBe(-1);
            expect(state.rotateLeft).toBe(true);
            expect(state.jump).toBe(true);
        });
    });

    describe('VR入力', () => {
        it('セッションがない場合は何もしない', () => {
            renderer.xr.getSession = vi.fn(() => null);
            const state = input.getState();
            expect(state.x).toBe(0);
            expect(state.z).toBe(0);
        });

        it('VRコントローラーの軸入力を処理', () => {
            const mockSession = {
                inputSources: [{
                    gamepad: {
                        axes: [0, 0, 0.5, -0.3],  // x, y, rightX, rightZ
                        buttons: []
                    }
                }]
            };
            renderer.xr.getSession = vi.fn(() => mockSession);

            const state = input.getState();
            expect(state.x).toBeCloseTo(0.5, 1);
            expect(state.z).toBeCloseTo(-0.3, 1);
        });

        it('デッドゾーン以下の入力を無視', () => {
            const mockSession = {
                inputSources: [{
                    gamepad: {
                        axes: [0, 0, 0.05, -0.05],  // デッドゾーン0.1未満
                        buttons: []
                    }
                }]
            };
            renderer.xr.getSession = vi.fn(() => mockSession);

            const state = input.getState();
            expect(state.x).toBe(0);
            expect(state.z).toBe(0);
        });

        it('VRボタン0でattackがtrueになる', () => {
            const mockSession = {
                inputSources: [{
                    gamepad: {
                        axes: [0, 0, 0, 0],
                        buttons: [{ pressed: true }]
                    }
                }]
            };
            renderer.xr.getSession = vi.fn(() => mockSession);

            const state = input.getState();
            expect(state.attack).toBe(true);
        });

        it('VRボタン1でjumpがtrueになる', () => {
            const mockSession = {
                inputSources: [{
                    gamepad: {
                        axes: [0, 0, 0, 0],
                        buttons: [{ pressed: false }, { pressed: true }]
                    }
                }]
            };
            renderer.xr.getSession = vi.fn(() => mockSession);

            const state = input.getState();
            expect(state.jump).toBe(true);
        });

        it('ゲームパッドがない入力ソースをスキップ', () => {
            const mockSession = {
                inputSources: [{ gamepad: null }]
            };
            renderer.xr.getSession = vi.fn(() => mockSession);

            const state = input.getState();
            expect(state.x).toBe(0);
            expect(state.z).toBe(0);
        });
    });
});
