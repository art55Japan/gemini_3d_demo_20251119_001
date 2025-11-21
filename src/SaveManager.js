import { Block } from './Block.js';
import * as THREE from 'three';

export class SaveManager {
    constructor(game) {
        this.game = game;
        this.storageKey = 'gemini_3d_save_v1';
    }

    save() {
        const saveData = {
            player: {
                position: this.game.player.position.toArray(),
                rotation: this.game.player.mesh.rotation.y
            },
            blocks: []
        };

        // Save Blocks
        this.game.entityManager.entities.forEach(entity => {
            if (entity instanceof Block) {
                saveData.blocks.push({
                    x: entity.mesh.position.x,
                    y: entity.mesh.position.y,
                    z: entity.mesh.position.z,
                    type: entity.type
                });
            }
        });

        try {
            const json = JSON.stringify(saveData);
            localStorage.setItem(this.storageKey, json);
            console.log("Game Saved!");
            this.game.showNotification("Game Saved!");
        } catch (e) {
            console.error("Failed to save game:", e);
            this.game.showNotification("Failed to save game: " + e.message, 4000);
        }
    }

    load() {
        const json = localStorage.getItem(this.storageKey);
        if (!json) {
            console.log("No save data found.");
            this.game.showNotification("No save data found.");
            return;
        }

        try {
            const saveData = JSON.parse(json);

            // Restore Player
            if (saveData.player) {
                this.game.player.position.fromArray(saveData.player.position);
                this.game.player.mesh.rotation.y = saveData.player.rotation;
                this.game.player.physics.velocity.set(0, 0, 0); // Reset velocity
                this.game.player.physics.onGround = false; // Let physics resolve ground
            }

            // Restore Blocks
            if (saveData.blocks) {
                // Clear existing blocks
                // We need to copy the array because we'll be modifying it while iterating
                const entitiesToRemove = this.game.entityManager.entities.filter(e => e instanceof Block);
                entitiesToRemove.forEach(e => {
                    e.shouldRemove = true;
                    // Also remove from collidables
                    const idx = this.game.collidables.indexOf(e.mesh);
                    if (idx > -1) this.game.collidables.splice(idx, 1);
                });

                // Force update to process removals immediately (optional, but cleaner)
                // Or just manually remove them now to avoid frame delay issues
                entitiesToRemove.forEach(e => this.game.entityManager.remove(e));

                // Add saved blocks
                saveData.blocks.forEach(blockData => {
                    const block = new Block(blockData.x, blockData.y, blockData.z, blockData.type);
                    this.game.entityManager.add(block);
                    this.game.collidables.push(block.mesh);
                });
            }

            console.log("Game Loaded!");
            this.game.showNotification("Game Loaded!");

        } catch (e) {
            console.error("Failed to load game:", e);
            this.game.showNotification("Failed to load game: " + e.message, 4000);
        }
    }
}
