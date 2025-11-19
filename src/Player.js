import * as THREE from 'three';

export class Player {
    constructor(scene) {
        this.scene = scene;
        this.position = new THREE.Vector3(0, 0, 0);
        this.speed = 10.0; // Doubled from 5.0
        this.rotationSpeed = 10.0;

        this.mesh = this.buildCharacter();
        this.mesh.position.copy(this.position);
        this.scene.add(this.mesh);
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
        group.add(swordGroup);

        // Shield (Left Hand)
        const shieldGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.05, 32);
        const shield = new THREE.Mesh(shieldGeo, metal);
        shield.position.set(-0.4, 0.6, 0.3); // Lifted 0.1
        shield.rotation.x = Math.PI / 2;
        shield.rotation.y = -Math.PI / 4;
        group.add(shield);

        return group;
    }

    update(delta, input) {
        if (input.x !== 0 || input.z !== 0) {
            // Movement
            const move = new THREE.Vector3(input.x, 0, input.z).normalize().multiplyScalar(this.speed * delta);
            this.position.add(move);
            this.mesh.position.copy(this.position);

            // Rotation (Face movement direction)
            const targetRotation = Math.atan2(move.x, move.z);
            // Smooth rotation could be added here, for now snap or simple lerp
            this.mesh.rotation.y = targetRotation;
        }
    }
}
