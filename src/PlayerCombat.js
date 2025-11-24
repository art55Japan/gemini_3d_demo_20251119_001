import * as THREE from 'three';

// State Interface
class CombatState {
    constructor(combatSystem) {
        this.combat = combatSystem;
    }
    enter() { }
    update(delta, input, entities) { }
    exit() { }
}

class IdleState extends CombatState {
    update(delta, input, entities) {
        if (input.attack) {
            this.combat.setState(new AttackingState(this.combat));
        }
    }
}

class AttackingState extends CombatState {
    constructor(combatSystem) {
        super(combatSystem);
        this.timer = 0;
        this.duration = 0.4;
    }

    enter() {
        if (this.combat.player.audioManager) this.combat.player.audioManager.playAttack();
    }

    update(delta, input, entities) {
        this.timer += delta;
        const progress = this.timer / this.duration;

        // Animation Logic (Functional approach with Math.min/max)
        // Swing down (0-0.5) -> Swing up (0.5-1.0)
        // Map progress to rotation
        const swingDown = progress * 2; // 0 to 1
        const swingUp = (progress - 0.5) * 2; // 0 to 1

        // Use Math.min to clamp swingDown at 1, and Math.max to start swingUp at 0
        // Rotation = Base + (SwingDown - SwingUp) * 90deg
        // Actually, let's keep it simple:
        // If progress < 0.5, rot = base + progress*2 * PI/2
        // If progress >= 0.5, rot = base + PI/2 - (progress-0.5)*2 * PI/2
        // Can we do this without if?
        // rot = base + (1 - Math.abs(progress * 2 - 1)) * (Math.PI / 2) ?
        // Let's check: p=0 -> 1-|-1| = 0. p=0.5 -> 1-|0| = 1. p=1 -> 1-|1| = 0.
        // Yes! Triangle wave function eliminates the if-else branch.

        const triangleWave = 1 - Math.abs(progress * 2 - 1);
        if (this.combat.sword) {
            this.combat.sword.rotation.x = this.combat.baseSwordRotation + triangleWave * (Math.PI / 2);
        }

        // Hit Detection Window (0.2 to 0.6)
        // Can use a boolean check or just run it. Running it multiple times is fine if we have a "hasHit" flag?
        // Or just check if in window.
        if (progress > 0.2 && progress < 0.6) {
            this.combat.checkAttackCollision(entities);
        }

        if (this.timer >= this.duration) {
            this.combat.setState(new IdleState(this.combat));
        }
    }

    exit() {
        if (this.combat.sword) {
            this.combat.sword.rotation.x = this.combat.baseSwordRotation;
        }
    }
}

export class PlayerCombat {
    constructor(player) {
        this.player = player;
        // Sword might not be loaded yet, or might not exist in the new model.
        // We will check for it dynamically or try to find it.
        this.sword = this.player.mesh.getObjectByName('sword');
        this.baseSwordRotation = Math.PI / 4;

        this.currentState = new IdleState(this);
    }

    setState(newState) {
        // Refresh sword reference if it was missing (async load)
        if (!this.sword) {
            this.sword = this.player.mesh.getObjectByName('sword');
        }

        if (this.currentState) this.currentState.exit();
        this.currentState = newState;
        this.currentState.enter();
    }

    update(delta, input, entities) {
        this.currentState.update(delta, input, entities);
    }

    checkAttackCollision(entities) {
        if (!entities) return;

        const attackRange = 2.0;
        const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.player.mesh.rotation.y);
        const attackPos = this.player.position.clone().add(forward.multiplyScalar(1.0));

        // Polymorphic check - filter for damageable entities
        entities
            .filter(e => e.takeDamage && e.position.distanceTo(attackPos) < attackRange)
            .forEach(e => {
                e.takeDamage();
                if (this.player.audioManager) this.player.audioManager.playEnemyDeath();
            });
    }
}
