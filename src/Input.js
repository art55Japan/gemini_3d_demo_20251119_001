export class Input {
    constructor(renderer) {
        this.renderer = renderer;
        this.keys = {
            w: false, a: false, s: false, d: false,
            arrowup: false, arrowleft: false, arrowdown: false, arrowright: false,
            up: false, left: false, down: false, right: false, // Legacy keys
            ' ': false, f: false, b: false, q: false, e: false, v: false
        };

        this.mouseDown = false;

        window.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            const code = e.code;
            // console.log(`Key Down: key='${key}', code='${code}'`); // Debug log active

            if (this.keys.hasOwnProperty(key)) {
                this.keys[key] = true;
            }

            // Robust Space check
            if (key === ' ' || code === 'Space') {
                this.keys[' '] = true;
                e.preventDefault();
            }

            // Prevent default behavior for arrow keys
            if (key.startsWith('arrow') || ['up', 'down', 'left', 'right'].includes(key)) {
                e.preventDefault();
            }
        });
        window.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            if (this.keys.hasOwnProperty(key)) this.keys[key] = false;
        });

        window.addEventListener('mouseup', () => {
            this.mouseDown = false;
        });

        this.rightMouseDown = false;
        window.addEventListener('contextmenu', (e) => {
            e.preventDefault(); // Prevent context menu
            // We handle right click state in mousedown/up but contextmenu event is good to block
        });
        window.addEventListener('mousedown', (e) => {
            if (e.button === 0) this.mouseDown = true;
            if (e.button === 2) this.rightMouseDown = true;
        });
        window.addEventListener('mouseup', (e) => {
            if (e.button === 0) this.mouseDown = false;
            if (e.button === 2) this.rightMouseDown = false;
        });

        this.mouse = { x: 0, y: 0 };
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        });
    }

    getState() {
        const move = {
            x: 0, z: 0,
            jump: false, attack: false,
            rotateLeft: false, rotateRight: false,
            toggleView: false,
            mouse: { ...this.mouse }
        };

        // Keyboard
        if (this.keys.w || this.keys.arrowup || this.keys.up) move.z -= 1;
        if (this.keys.s || this.keys.arrowdown || this.keys.down) move.z += 1;

        // Rotation (Replaces Strafing)
        if (this.keys.a || this.keys.arrowleft || this.keys.left) move.rotateLeft = true;
        if (this.keys.d || this.keys.arrowright || this.keys.right) move.rotateRight = true;

        // Jump Input
        if (this.keys[' ']) move.jump = true;

        // Attack Input
        if (this.keys.f || this.mouseDown) move.attack = true;

        // VR Controller
        const session = this.renderer.xr.getSession();
        if (session) {
            for (const source of session.inputSources) {
                if (source.gamepad) {
                    // Standard XR Gamepad Mapping
                    // Axes 2 and 3 are usually the thumbstick (X, Y)
                    const axes = source.gamepad.axes;
                    if (axes.length >= 4) {
                        // Deadzone
                        const deadzone = 0.1;

                        // X-axis (Left/Right)
                        if (Math.abs(axes[2]) > deadzone) {
                            move.x += axes[2];
                        }

                        // Y-axis (Up/Down) - Inverted in some mappings, but usually Up is -1
                        if (Math.abs(axes[3]) > deadzone) {
                            move.z += axes[3];
                        }
                    }

                    // Buttons
                    // Button 0 (Trigger) or 4/5 (A/X) usually used for actions
                    if (source.gamepad.buttons.some(b => b.pressed)) {
                        // Simple mapping: Trigger for attack, A for jump?
                        // Let's say Button 0 (Trigger) is Attack, Button 4 (A) is Jump
                        if (source.gamepad.buttons[0] && source.gamepad.buttons[0].pressed) {
                            move.attack = true;
                        }
                        if (source.gamepad.buttons[4] && source.gamepad.buttons[4].pressed) {
                            move.jump = true;
                        }
                        // Fallback if specific buttons aren't clear, just use any for jump for now as before?
                        // No, let's try to be specific or the user will jump when attacking.
                        // Previous logic was: if (source.gamepad.buttons.some(b => b.pressed)) move.jump = true;
                        // Let's keep it simple for now: Trigger (0) -> Attack, Squeeze (1) -> Jump
                        if (source.gamepad.buttons[1] && source.gamepad.buttons[1].pressed) {
                            move.jump = true;
                        }
                    }
                }
            }
        }

        // Build Mode Inputs
        if (this.keys.b) {
            move.toggleBuildMode = true;
        }
        if (this.keys.v) {
            move.toggleView = true;
        }
        if (this.mouseDown) move.placeBlock = true; // Left click
        if (this.rightMouseDown) move.removeBlock = true; // Right click

        return move;
    }
}
