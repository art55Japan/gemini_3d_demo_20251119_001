import * as THREE from 'three';

export class PlayerCombat {
    constructor(player) {
        this.player = player;
        this.sword = this.player.mesh.getObjectByName('sword');
        this.isAttacking = false;
        this.attackTimer = 0;
        this.attackDuration = 0.4;
        this.baseSwordRotation = Math.PI / 4;
    }

    update(delta, input, entities) {
        if (input.attack && !this.isAttacking) {
            this.isAttacking = true;
            this.attackTimer = 0;
            if (this.player.audioManager) this.player.audioManager.playAttack();
        }

        if (this.isAttacking) {
            this.attackTimer += delta;

            // Sword Animation (Swing down and up)
            // 0 to 0.5: Swing down
            // 0.5 to 1.0: Swing up
            const progress = this.attackTimer / this.attackDuration;

            if (progress < 0.5) {
                // Swing down
                this.sword.rotation.x = this.baseSwordRotation + (progress * 2) * (Math.PI / 2);
            } else {
                // Swing up
                this.sword.rotation.x = this.baseSwordRotation + (Math.PI / 2) - ((progress - 0.5) * 2) * (Math.PI / 2);
            }

            // Check Hit (only during the middle of the swing)
            if (progress > 0.2 && progress < 0.6) {
                this.checkAttackCollision(entities);
            }

            if (this.attackTimer >= this.attackDuration) {
                this.isAttacking = false;
                this.sword.rotation.x = this.baseSwordRotation;
            }
        }
    }

    checkAttackCollision(entities) {
        if (!entities) return;

        const attackRange = 2.0;
        const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.player.mesh.rotation.y);
        const attackPos = this.player.position.clone().add(forward.multiplyScalar(1.0)); // Hitbox center in front of player

        for (const entity of entities) {
            if (entity.constructor.name === 'Slime') {
                const dist = attackPos.distanceTo(entity.position);
                if (dist < attackRange) {
                    if (entity.takeDamage) {
                        entity.takeDamage();
                        if (this.player.audioManager) this.player.audioManager.playEnemyDeath();
                    }
                }
            }
        }
    }
}
