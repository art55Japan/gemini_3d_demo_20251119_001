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

        // VR Controller (Simplified)
        const session = this.renderer.xr.getSession();
        if (session) {
            // TODO: Implement VR controller input
            // This requires accessing input sources from the session or frame
            // For now, we rely on keyboard for testing
        }

        return move;
    }
}
