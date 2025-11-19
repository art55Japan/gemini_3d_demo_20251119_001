import * as THREE from 'three';

export class Player {
    constructor(scene, audioManager) {
        this.scene = scene;
        this.audioManager = audioManager;
        this.position = new THREE.Vector3(0, 0, 0);
        this.speed = 10.0; // Doubled from 5.0
        this.rotationSpeed = 10.0;

        this.mesh = this.buildCharacter();
        this.mesh.position.copy(this.position);
        this.scene.add(this.mesh);

        // Physics
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.knockbackVelocity = new THREE.Vector3(0, 0, 0);
        this.onGround = true;
        this.gravity = -20.0;
        this.jumpStrength = 8.0;

        // Collision
        this.raycaster = new THREE.Raycaster();
        this.downVector = new THREE.Vector3(0, -1, 0);

        // Combat
        this.sword = this.mesh.getObjectByName('sword');
        this.isAttacking = false;
        this.attackTimer = 0;
        this.attackDuration = 0.4;
        this.baseSwordRotation = Math.PI / 4;
    }

    createFeltTexture(colorHex) {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Base color
        ctx.fillStyle = colorHex;
        ctx.fillRect(0, 0, 512, 512);

        // Noise
        for (let i = 0; i < 50000; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const opacity = Math.random() * 0.1 + 0.05;
            ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
            ctx.fillRect(x, y, 2, 2);

            const x2 = Math.random() * 512;
            const y2 = Math.random() * 512;
            const opacity2 = Math.random() * 0.1 + 0.05;
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity2})`;
            ctx.fillRect(x2, y2, 2, 2);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }

    buildCharacter() {
        const group = new THREE.Group();

        // Textures
        const whiteFeltTex = this.createFeltTexture('#ffffff');
        const pinkFeltTex = this.createFeltTexture('#FFB6C1');
        const blueFeltTex = this.createFeltTexture('#0000ff');

        // Materials
        const whiteFelt = new THREE.MeshStandardMaterial({
            map: whiteFeltTex,
            bumpMap: whiteFeltTex,
            bumpScale: 0.02,
            roughness: 1.0
        });

        const metal = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.4, metalness: 0.6 });

        const blueCloth = new THREE.MeshStandardMaterial({
            map: blueFeltTex,
            bumpMap: blueFeltTex,
            bumpScale: 0.01,
            side: THREE.DoubleSide,
            roughness: 0.9
        });

        const leather = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.8 });

        const pinkSkin = new THREE.MeshStandardMaterial({
            map: pinkFeltTex,
            bumpMap: pinkFeltTex,
            bumpScale: 0.01,
            roughness: 1.0
        });

        const black = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
        const plasticBlack = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.1, metalness: 0.1 }); // Glossy plastic

        // --- Body ---
        const bodyGeo = new THREE.SphereGeometry(0.4, 32, 32);
        const body = new THREE.Mesh(bodyGeo, whiteFelt);
        body.position.y = 0.5; // Lifted 0.1
        body.castShadow = true;
        group.add(body);

        // Legs
        const legGeo = new THREE.CapsuleGeometry(0.1, 0.5, 4, 8); // Longer (0.4 -> 0.5)
        const legL = new THREE.Mesh(legGeo, whiteFelt);
        legL.position.set(-0.15, 0.25, 0); // Lifted center to match length
        group.add(legL);

        const legR = new THREE.Mesh(legGeo, whiteFelt);
        legR.position.set(0.15, 0.25, 0); // Lifted center
        group.add(legR);

        // Boots
        const bootGeo = new THREE.CapsuleGeometry(0.12, 0.15, 4, 8);
        const bootL = new THREE.Mesh(bootGeo, metal); // Changed to metal
        bootL.position.set(-0.15, 0.1, 0); // Kept at bottom
        group.add(bootL);

        const bootR = new THREE.Mesh(bootGeo, metal); // Changed to metal
        bootR.position.set(0.15, 0.1, 0);
        group.add(bootR);

        // Feet
        const footGeo = new THREE.SphereGeometry(0.12, 16, 16); // Rounder and bigger
        const footL = new THREE.Mesh(footGeo, metal); // Changed to metal
        footL.scale.set(1, 0.6, 1.5); // Flattened and elongated
        footL.position.set(-0.15, 0.05, 0.1); // Adjusted position
        group.add(footL);

        const footR = new THREE.Mesh(footGeo, metal); // Changed to metal
        footR.scale.set(1, 0.6, 1.5);
        footR.position.set(0.15, 0.05, 0.1);
        group.add(footR);

        // --- Head Group ---
        const headGroup = new THREE.Group();
        headGroup.position.y = 0.95; // Lifted 0.1
        group.add(headGroup);

        // Head Base
        const headGeo = new THREE.SphereGeometry(0.35, 32, 32);
        const head = new THREE.Mesh(headGeo, whiteFelt);
        head.castShadow = true;
        headGroup.add(head);

        // Ears
        const earGeo = new THREE.CapsuleGeometry(0.08, 0.45, 4, 8);

        const earL = new THREE.Mesh(earGeo, whiteFelt);
        earL.position.set(-0.12, 0.4, 0);
        earL.rotation.z = 0.1;
        earL.castShadow = true;
        headGroup.add(earL);

        const earR = new THREE.Mesh(earGeo, whiteFelt);
        earR.position.set(0.12, 0.4, 0);
        earR.rotation.z = -0.1;
        earR.castShadow = true;
        headGroup.add(earR);

        // Inner Ears (Pink)
        const innerEarGeo = new THREE.CapsuleGeometry(0.05, 0.35, 4, 8);
        const innerEarL = new THREE.Mesh(innerEarGeo, pinkSkin);
        innerEarL.position.set(-0.12, 0.4, 0.06);
        innerEarL.rotation.z = 0.1;
        headGroup.add(innerEarL);

        const innerEarR = new THREE.Mesh(innerEarGeo, pinkSkin);
        innerEarR.position.set(0.12, 0.4, 0.06);
        innerEarR.rotation.z = -0.1;
        headGroup.add(innerEarR);

        // Eyes
        const eyeGeo = new THREE.SphereGeometry(0.05, 32, 32); // Bigger and smoother
        const eyeL = new THREE.Mesh(eyeGeo, plasticBlack);
        eyeL.position.set(-0.13, 0.05, 0.32); // Moved back
        headGroup.add(eyeL);

        const eyeR = new THREE.Mesh(eyeGeo, plasticBlack);
        eyeR.position.set(0.13, 0.05, 0.32); // Moved back
        headGroup.add(eyeR);

        // Eye Highlights
        const highlightGeo = new THREE.SphereGeometry(0.015);
        const highlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff }); // Basic material for bright white

        const highlightL = new THREE.Mesh(highlightGeo, highlightMat);
        highlightL.position.set(-0.02, 0.02, 0.04); // Relative to eye
        eyeL.add(highlightL);

        const highlightR = new THREE.Mesh(highlightGeo, highlightMat);
        highlightR.position.set(-0.02, 0.02, 0.04); // Relative to eye
        eyeR.add(highlightR);

        // Nose
        const noseGeo = new THREE.SphereGeometry(0.02);
        const nose = new THREE.Mesh(noseGeo, pinkSkin);
        nose.position.set(0, -0.02, 0.34);
        headGroup.add(nose);

        // Mouth (Small cylinder line)
        const mouthGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.05);
        const mouthL = new THREE.Mesh(mouthGeo, black);
        mouthL.position.set(-0.02, -0.08, 0.32);
        mouthL.rotation.z = 0.5;
        mouthL.rotation.x = 1.5;
        headGroup.add(mouthL);

        const mouthR = new THREE.Mesh(mouthGeo, black);
        mouthR.position.set(0.02, -0.08, 0.32);
        mouthR.rotation.z = -0.5;
        mouthR.rotation.x = 1.5;
        headGroup.add(mouthR);

        // --- Armor ---

        // Helmet
        const helmetGeo = new THREE.SphereGeometry(0.36, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
        const helmet = new THREE.Mesh(helmetGeo, metal);
        helmet.position.y = 0.1; // Relative to headGroup
        helmet.castShadow = true;
        headGroup.add(helmet);

        // Helmet Rim
        const rimGeo = new THREE.TorusGeometry(0.36, 0.03, 8, 32); // Wider rim (0.02 -> 0.03)
        const rim = new THREE.Mesh(rimGeo, metal);
        rim.rotation.x = Math.PI / 2;
        rim.position.y = 0.1;
        headGroup.add(rim);

        // Helmet Bolts
        const darkMetal = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.5, metalness: 0.8 });
        const boltGeo = new THREE.SphereGeometry(0.01); // Smaller
        for (let i = 0; i < 48; i++) { // Increased to 48 (3x)
            const angle = (i / 48) * Math.PI * 2;
            const bolt = new THREE.Mesh(boltGeo, darkMetal);
            bolt.position.set(
                Math.cos(angle) * 0.40, // Moved out (0.39 -> 0.40) to match wider rim
                0.12,
                Math.sin(angle) * 0.40
            );
            headGroup.add(bolt);
        }

        // Chest Armor
        const armorGeo = new THREE.CylinderGeometry(0.41, 0.41, 0.3, 32);
        const armor = new THREE.Mesh(armorGeo, metal);
        armor.position.y = 0.65; // Lifted 0.1
        armor.castShadow = true;
        group.add(armor);

        // Armor Collar (Rounded top)
        const collarGeo = new THREE.TorusGeometry(0.41, 0.03, 8, 32);
        const collar = new THREE.Mesh(collarGeo, metal);
        collar.position.y = 0.8; // Top of armor (0.65 + 0.15)
        collar.rotation.x = Math.PI / 2;
        group.add(collar);

        // Chest Rivets (Royal Crest Pattern)
        const chestBoltGeo = new THREE.SphereGeometry(0.012); // Even smaller for fine detail
        const positions = [
            // Center
            { x: 0, y: 0.65 },
            // Inner Diamond
            { x: 0, y: 0.68 }, { x: 0, y: 0.62 },
            { x: -0.04, y: 0.65 }, { x: 0.04, y: 0.65 },
            // Outer Cross Tips
            { x: 0, y: 0.73 }, { x: 0, y: 0.57 },
            { x: -0.09, y: 0.65 }, { x: 0.09, y: 0.65 },
            // Corner Accents
            { x: -0.06, y: 0.69 }, { x: 0.06, y: 0.69 },
            { x: -0.06, y: 0.61 }, { x: 0.06, y: 0.61 }
        ];

        positions.forEach(pos => {
            const bolt = new THREE.Mesh(chestBoltGeo, darkMetal);
            const z = Math.sqrt(0.41 * 0.41 - pos.x * pos.x);
            bolt.position.set(pos.x, pos.y, z);
            group.add(bolt);
        });

        // Shoulder Pads
        // More rounded: larger radius, fuller sphere section (0.5 PI -> 0.75 PI)
        const shoulderGeo = new THREE.SphereGeometry(0.16, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.75);

        const shoulderL = new THREE.Mesh(shoulderGeo, metal);
        shoulderL.position.set(-0.35, 0.65, 0); // Adjusted Y slightly
        shoulderL.rotation.z = 0.5;
        group.add(shoulderL);

        const shoulderR = new THREE.Mesh(shoulderGeo, metal);
        shoulderR.position.set(0.35, 0.65, 0); // Adjusted Y slightly
        shoulderR.rotation.z = -0.5;
        group.add(shoulderR);

        // Belt
        const beltGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.08, 32);
        const belt = new THREE.Mesh(beltGeo, leather);
        belt.position.y = 0.45; // Lifted 0.1
        group.add(belt);

        const buckleGeo = new THREE.BoxGeometry(0.1, 0.1, 0.05);
        const buckle = new THREE.Mesh(buckleGeo, metal);
        buckle.position.set(0, 0.45, 0.4); // Lifted 0.1
        group.add(buckle);

        // --- Accessories ---

        // Cape
        const capeGeo = new THREE.PlaneGeometry(0.6, 0.8);
        const cape = new THREE.Mesh(capeGeo, blueCloth);
        cape.position.set(0, 0.8, -0.35); // Lifted 0.1
        cape.rotation.x = THREE.MathUtils.degToRad(10);
        cape.rotation.y = THREE.MathUtils.degToRad(180);
        group.add(cape);

        // Sword (Right Hand)
        const swordGroup = new THREE.Group();
        swordGroup.position.set(0.5, 0.6, 0.3); // Lifted 0.1

        const handleGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.2);
        const handle = new THREE.Mesh(handleGeo, leather);
        swordGroup.add(handle);

        const guardGeo = new THREE.BoxGeometry(0.2, 0.02, 0.05);
        const guard = new THREE.Mesh(guardGeo, metal);
        guard.position.y = 0.1;
        swordGroup.add(guard);

        const bladeGeo = new THREE.BoxGeometry(0.06, 0.6, 0.02);
        const blade = new THREE.Mesh(bladeGeo, metal);
        blade.position.y = 0.4;
        swordGroup.add(blade);

        swordGroup.rotation.x = Math.PI / 4;
        swordGroup.name = 'sword';
        group.add(swordGroup);

        // Shield (Left Hand)
        const shieldGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.05, 32);
        const shield = new THREE.Mesh(shieldGeo, metal);
        shield.position.set(-0.4, 0.6, 0.3); // Lifted 0.1
        return group;
    }

    update(delta, input, time, collidables, entities) {
        // Movement
        const moveX = input.x;
        const moveZ = input.z;

        if (moveX !== 0 || moveZ !== 0) {
            const moveVector = new THREE.Vector3(moveX, 0, moveZ).normalize();

            // Move relative to camera/world (simplified for now)
            this.position.x += moveVector.x * this.speed * delta;
            this.position.z += moveVector.z * this.speed * delta;

            // Rotate character to face movement direction
            const angle = Math.atan2(moveVector.x, moveVector.z);
            const targetRotation = angle;

            // Smooth rotation
            let diff = targetRotation - this.mesh.rotation.y;
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;

            this.mesh.rotation.y += diff * this.rotationSpeed * delta;
        }

        // Apply Knockback Velocity
        this.position.x += this.knockbackVelocity.x * delta;
        this.position.z += this.knockbackVelocity.z * delta;

        // Friction for knockback
        this.knockbackVelocity.multiplyScalar(0.9);
        if (this.knockbackVelocity.length() < 0.1) {
            this.knockbackVelocity.set(0, 0, 0);
        }

        // Raycast for Ground/Platform Detection
        let groundHeight = 0;
        if (collidables && collidables.length > 0) {
            // Cast ray from slightly above player position downwards
            const rayOrigin = this.position.clone();
            rayOrigin.y += 1.0; // Start ray 1 unit above

            this.raycaster.set(rayOrigin, this.downVector);

            const intersects = this.raycaster.intersectObjects(collidables, true); // Recursive check

            if (intersects.length > 0) {
                // Find the highest intersection that is below the player's feet (plus some tolerance)
                // intersects are sorted by distance.
                // We want the first hit that is reasonable.
                const hit = intersects[0];
                // If the hit point is close to our current Y (or below us), treat it as ground
                // hit.point.y is the world height of the collision
                groundHeight = hit.point.y;
            }
        }

        // Jump & Gravity
        if (this.onGround && input.jump) {
            this.velocity.y = this.jumpStrength;
            this.onGround = false;
            if (this.audioManager) this.audioManager.playJump();
        }

        // Apply Gravity
        this.velocity.y += this.gravity * delta;
        this.position.y += this.velocity.y * delta;

        // Ground/Platform Collision
        if (this.position.y <= groundHeight) {
            this.position.y = groundHeight;
            this.velocity.y = 0;
            this.onGround = true;
        } else {
            // If we walked off a platform, we are no longer on ground (unless jumping)
            // But we need to be careful not to flicker onGround state when just standing
            // Simple check: if we are significantly above groundHeight and falling, we are in air
            if (this.position.y > groundHeight + 0.1 && this.velocity.y < 0) {
                this.onGround = false;
            }
        }

        this.mesh.position.copy(this.position);

        // Combat Update
        this.updateAttack(delta, input, entities);

        // Enemy Collision (Knockback)
        this.checkEnemyCollision(entities);

        // Environment Collision (Trees, Rocks)
        this.checkEnvironmentCollision(entities);
    }

    checkEnvironmentCollision(entities) {
        if (!entities) return;

        const playerRadius = 0.4; // Player body radius

        for (const entity of entities) {
            let obstacleRadius = 0;
            let obstacleHeight = 0;

            if (entity.constructor.name === 'Tree') {
                obstacleRadius = 0.3; // Trunk radius + buffer
                obstacleHeight = 10.0; // Too high to jump over
            } else if (entity.constructor.name === 'Rock') {
                const scale = entity.scale || 1.0;
                obstacleRadius = 0.6 * scale;
                obstacleHeight = 0.7 * scale; // Allow standing on top
            } else {
                continue;
            }

            // Check Height
            if (this.position.y > obstacleHeight) continue; // Above the obstacle

            // Check Distance (XZ plane)
            const dx = this.position.x - entity.mesh.position.x;
            const dz = this.position.z - entity.mesh.position.z;
            const distance = Math.sqrt(dx * dx + dz * dz);
            const minDistance = playerRadius + obstacleRadius;

            if (distance < minDistance) {
                // Collision detected
                // Push player out
                const angle = Math.atan2(dz, dx);
                const pushX = Math.cos(angle) * minDistance;
                const pushZ = Math.sin(angle) * minDistance;

                this.position.x = entity.mesh.position.x + pushX;
                this.position.z = entity.mesh.position.z + pushZ;

                // console.log(`Env Collision with ${entity.constructor.name}: Pushed to ${this.position.x.toFixed(2)}, ${this.position.z.toFixed(2)}`);
            }
        }
    }

    checkEnemyCollision(entities) {
        if (!entities) return;

        const collisionRange = 0.8; // Body radius + Slime radius

        for (const entity of entities) {
            if (entity.constructor.name === 'Slime' && !entity.isDead) {
                const dist = this.position.distanceTo(entity.position);
                if (dist < collisionRange) {
                    // Calculate knockback direction (away from slime)
                    const knockbackDir = this.position.clone().sub(entity.position).normalize();

                    // Apply horizontal knockback
                    const knockbackStrength = 15.0;
                    this.knockbackVelocity.x = knockbackDir.x * knockbackStrength;
                    this.knockbackVelocity.z = knockbackDir.z * knockbackStrength;

                    // Apply vertical knockback (small hop)
                    this.velocity.y = 5.0;
                    this.onGround = false;

                    // console.log('Player hit by slime! Knockback!');
                    if (this.audioManager) this.audioManager.playHit();
                }
            }
        }
    }

    updateAttack(delta, input, entities) {
        if (input.attack && !this.isAttacking) {
            this.isAttacking = true;
            this.attackTimer = 0;
            if (this.audioManager) this.audioManager.playAttack();
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
        const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.mesh.rotation.y);
        const attackPos = this.position.clone().add(forward.multiplyScalar(1.0)); // Hitbox center in front of player

        for (const entity of entities) {
            if (entity.constructor.name === 'Slime') {
                const dist = attackPos.distanceTo(entity.position);
                if (dist < attackRange) {
                    if (entity.takeDamage) {
                        entity.takeDamage();
                        if (this.audioManager) this.audioManager.playEnemyDeath();
                    }
                }
            }
        }
    }
}

