export class Input {
    constructor(renderer) {
        this.renderer = renderer;
        this.keys = {
            w: false, a: false, s: false, d: false,
            arrowup: false, arrowleft: false, arrowdown: false, arrowright: false,
            ' ': false, f: false
        };

        this.mouseDown = false;

        window.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            if (this.keys.hasOwnProperty(key)) this.keys[key] = true;
        });
        window.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            if (this.keys.hasOwnProperty(key)) this.keys[key] = false;
        });

        window.addEventListener('mousedown', () => {
            this.mouseDown = true;
        });
        window.addEventListener('mouseup', () => {
            this.mouseDown = false;
        });
    }

    getState() {
        const move = { x: 0, z: 0, jump: false, attack: false };

        // Keyboard
        if (this.keys.w || this.keys.arrowup) move.z -= 1;
        if (this.keys.s || this.keys.arrowdown) move.z += 1;
        if (this.keys.a || this.keys.arrowleft) move.x -= 1;
        if (this.keys.d || this.keys.arrowright) move.x += 1;

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

        return move;
    }
}
