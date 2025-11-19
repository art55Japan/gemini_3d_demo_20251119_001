export class Input {
    constructor(renderer) {
        this.renderer = renderer;
        this.keys = {
            w: false, a: false, s: false, d: false,
            ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false
        };

        window.addEventListener('keydown', (e) => {
            if (this.keys.hasOwnProperty(e.key)) this.keys[e.key] = true;
        });
        window.addEventListener('keyup', (e) => {
            if (this.keys.hasOwnProperty(e.key)) this.keys[e.key] = false;
        });
    }

    getState() {
        const move = { x: 0, z: 0 };

        // Keyboard
        if (this.keys.w || this.keys.ArrowUp) move.z -= 1;
        if (this.keys.s || this.keys.ArrowDown) move.z += 1;
        if (this.keys.a || this.keys.ArrowLeft) move.x -= 1;
        if (this.keys.d || this.keys.ArrowRight) move.x += 1;

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
                }
            }
        }

        return move;
    }
}
