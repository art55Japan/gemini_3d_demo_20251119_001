import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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

    it('should map keys to commands', () => {
        // Press 'w' -> forward
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }));
        expect(input.activeKeys.has('forward')).toBe(true);

        // Release 'w'
        window.dispatchEvent(new KeyboardEvent('keyup', { key: 'w' }));
        expect(input.activeKeys.has('forward')).toBe(false);
    });

    it('should handle multiple keys', () => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' })); // forward
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' })); // rotateLeft

        const state = input.getState();
        expect(state.z).toBe(-1); // forward is negative Z
        expect(state.rotateLeft).toBe(true);
    });

    it('should handle mouse input', () => {
        window.dispatchEvent(new MouseEvent('mousedown', { button: 0 })); // Left click
        expect(input.mouseDown).toBe(true);

        const state = input.getState();
        expect(state.attack).toBe(true);
        expect(state.placeBlock).toBe(true);

        window.dispatchEvent(new MouseEvent('mouseup', { button: 0 }));
        expect(input.mouseDown).toBe(false);
    });

    it('should ignore unmapped keys', () => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'z' })); // Not mapped
        expect(input.activeKeys.size).toBe(0);
    });
});
