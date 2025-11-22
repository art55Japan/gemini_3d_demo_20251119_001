import { vi } from 'vitest';

// Mock LocalStorage
const localStorageMock = (function () {
    let store = {};
    return {
        getItem: vi.fn((key) => store[key] || null),
        setItem: vi.fn((key, value) => { store[key] = value.toString(); }),
        removeItem: vi.fn((key) => { delete store[key]; }),
        clear: vi.fn(() => { store = {}; }),
        length: 0,
        key: vi.fn((i) => Object.keys(store)[i] || null),
    };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock Audio
global.Audio = vi.fn().mockImplementation(() => ({
    play: vi.fn(),
    pause: vi.fn(),
    currentTime: 0,
}));

// Mock URL.createObjectURL for Three.js loaders if needed
global.URL.createObjectURL = vi.fn();

// Mock console to keep test output clean (optional, but good for expected errors)
// global.console.error = vi.fn();
// global.console.warn = vi.fn();

// Mock Canvas getContext for Three.js textures
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    getImageData: vi.fn(() => ({ data: [] })),
    putImageData: vi.fn(),
    createImageData: vi.fn(() => []),
    setTransform: vi.fn(),
    drawImage: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    measureText: vi.fn(() => ({ width: 0 })),
    transform: vi.fn(),
    rect: vi.fn(),
    clip: vi.fn(),
}));

HTMLCanvasElement.prototype.toDataURL = vi.fn(() => '');
