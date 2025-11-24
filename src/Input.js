export class Input {
    constructor(renderer) {
        this.renderer = renderer;
        this.activeKeys = new Set();
        this.mouseDown = false;
        this.rightMouseDown = false;
        this.mouse = { x: 0, y: 0 };
        this.mouseDelta = { x: 0, y: 0 };

        // Data-Driven Key Mapping
        this.keyMap = {
            'w': 'forward', 'arrowup': 'forward', 'up': 'forward',
            's': 'backward', 'arrowdown': 'backward', 'down': 'backward',
            'a': 'rotateLeft', 'arrowleft': 'rotateLeft', 'left': 'rotateLeft',
            'd': 'rotateRight', 'arrowright': 'rotateRight', 'right': 'rotateRight',
            'q': 'cameraLeft',
            'e': 'cameraRight',
            ' ': 'jump',
            'f': 'attack',
            'b': 'toggleBuildMode',
            'v': 'toggleView',
            'k': 'save',
            'l': 'load',
            'm': 'menu'
        };

        this.setupListeners();
    }

    setupListeners() {
        window.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            if (this.keyMap[key]) {
                this.activeKeys.add(this.keyMap[key]);
            }
            // Special cases that need preventDefault
            if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            if (this.keyMap[key]) {
                this.activeKeys.delete(this.keyMap[key]);
            }
        });

        window.addEventListener('mousedown', (e) => {
            if (e.button === 0) this.mouseDown = true;
            if (e.button === 2) this.rightMouseDown = true;
        });

        window.addEventListener('mouseup', (e) => {
            if (e.button === 0) this.mouseDown = false;
            if (e.button === 2) this.rightMouseDown = false;
        });

        window.addEventListener('mousemove', (e) => {
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
            this.mouseDelta.x += e.movementX || 0;
            this.mouseDelta.y += e.movementY || 0;
        });

        window.addEventListener('contextmenu', e => e.preventDefault());
    }

    getState() {
        // Initialize state with default values
        const state = {
            x: 0, z: 0,
            jump: this.activeKeys.has('jump'),
            attack: this.activeKeys.has('attack') || this.mouseDown,
            rotateLeft: this.activeKeys.has('rotateLeft'),
            rotateRight: this.activeKeys.has('rotateRight'),
            cameraLeft: this.activeKeys.has('cameraLeft'),
            cameraRight: this.activeKeys.has('cameraRight'),
            toggleBuildMode: this.activeKeys.has('toggleBuildMode'),
            toggleView: this.activeKeys.has('toggleView'),
            placeBlock: this.mouseDown,
            removeBlock: this.rightMouseDown,
            save: this.activeKeys.has('save'),
            load: this.activeKeys.has('load'),
            menu: this.activeKeys.has('menu'),
            mouse: { ...this.mouse },
            mouseDelta: { ...this.mouseDelta }
        };

        // Reset delta after reading
        this.mouseDelta = { x: 0, y: 0 };

        // Calculate movement vector
        // No if-statements for movement direction, just math
        state.z += this.activeKeys.has('backward') ? 1 : 0;
        state.z -= this.activeKeys.has('forward') ? 1 : 0;

        // VR Input Handling
        this.handleVRInput(state);

        return state;
    }

    handleVRInput(state) {
        const session = this.renderer.xr.getSession();
        if (!session) return;

        for (const source of session.inputSources) {
            if (!source.gamepad) continue;

            const axes = source.gamepad.axes;
            if (axes.length >= 4) {
                const deadzone = 0.1;
                // Use Math.abs and sign to avoid if-checks for threshold? 
                // Actually simple threshold check is fine, but we can make it cleaner.
                // For now, keeping the logic simple but structured.
                if (Math.abs(axes[2]) > deadzone) state.x += axes[2];
                if (Math.abs(axes[3]) > deadzone) state.z += axes[3];
            }

            // Button mapping
            const buttons = source.gamepad.buttons;
            if (buttons[0]?.pressed) state.attack = true; // Trigger
            if (buttons[1]?.pressed) state.jump = true;   // Squeeze
        }
    }
}
