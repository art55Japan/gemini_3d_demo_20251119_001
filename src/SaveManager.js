import { Block } from './Block.js';
import { Slime } from './Slime.js';
import * as THREE from 'three';



export class SaveManager {
    constructor(game) {
        this.game = game;
        this.prefix = 'gemini_3d_save_';
        this.quickKey = 'gemini_3d_quick_save';
    }

    _createSaveData(summary) {
        const saveData = {
            timestamp: Date.now(),
            summary: summary,
            player: {
                position: this.game.player.position.toArray(),
                rotation: this.game.player.mesh.rotation.y
            },
            blocks: [],
            enemies: []
        };

        // Save Entities
        this.game.entityManager.entities.forEach(entity => {
            if (entity instanceof Block) {
                saveData.blocks.push({
                    x: entity.mesh.position.x,
                    y: entity.mesh.position.y,
                    z: entity.mesh.position.z,
                    type: entity.type
                });
            } else if (entity instanceof Slime && !entity.isDead) {
                saveData.enemies.push({
                    type: 'slime',
                    x: entity.position.x,
                    z: entity.position.z
                });
            }
        });
        return saveData;
    }

    _restoreSaveData(saveData) {
        // Restore Player
        if (saveData.player) {
            this.game.player.position.fromArray(saveData.player.position);
            this.game.player.mesh.rotation.y = saveData.player.rotation;
            this.game.player.physics.velocity.set(0, 0, 0);
            this.game.player.physics.onGround = false;
        }

        // Restore Blocks & Enemies
        if (saveData.blocks || saveData.enemies) {
            // Clear existing entities (Blocks and Slimes)
            const entitiesToRemove = this.game.entityManager.entities.filter(e => e instanceof Block || e instanceof Slime);
            entitiesToRemove.forEach(e => {
                e.shouldRemove = true;
                if (e.mesh) {
                    const idx = this.game.collidables.indexOf(e.mesh);
                    if (idx > -1) this.game.collidables.splice(idx, 1);
                }
            });

            // Force cleanup immediately
            entitiesToRemove.forEach(e => this.game.entityManager.remove(e));

            // Add saved blocks
            if (saveData.blocks) {
                saveData.blocks.forEach(blockData => {
                    const block = new Block(blockData.x, blockData.y, blockData.z, blockData.type);
                    this.game.entityManager.add(block);
                    this.game.collidables.push(block.mesh);
                });
            }

            // Add saved enemies
            if (saveData.enemies) {
                saveData.enemies.forEach(enemyData => {
                    if (enemyData.type === 'slime') {
                        const slime = new Slime(enemyData.x, enemyData.z);
                        this.game.entityManager.add(slime);
                    }
                });
            }
        }
    }

    quickSave() {
        const summary = `Quick Save at ${new Date().toLocaleTimeString()}`;
        const saveData = this._createSaveData(summary);
        try {
            const json = JSON.stringify(saveData);
            localStorage.setItem(this.quickKey, json);
            console.log("Quick Save Successful!");
            this.game.showNotification("Quick Save Successful!");
        } catch (e) {
            console.error("Failed to quick save:", e);
            this.game.showNotification("Failed to quick save: " + e.message, 4000);
        }
    }

    quickLoad() {
        const json = localStorage.getItem(this.quickKey);
        if (!json) {
            this.game.showNotification("No quick save found.");
            return;
        }
        try {
            const saveData = JSON.parse(json);
            this._restoreSaveData(saveData);
            console.log("Quick Load Successful!");
            this.game.showNotification("Quick Load Successful!");
        } catch (e) {
            console.error("Failed to quick load:", e);
            this.game.showNotification("Failed to quick load: " + e.message, 4000);
        }
    }

    getSlots() {
        const slots = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(this.prefix)) {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    slots.push({
                        id: key.replace(this.prefix, ''),
                        timestamp: data.timestamp,
                        summary: data.summary || 'Unknown Location'
                    });
                } catch (e) {
                    console.warn(`Failed to parse save slot ${key}`, e);
                }
            }
        }
        return slots.sort((a, b) => b.timestamp - a.timestamp); // Newest first
    }

    save(slotId) {
        const summary = `Player at ${Math.round(this.game.player.position.x)}, ${Math.round(this.game.player.position.z)}`;
        const saveData = this._createSaveData(summary);

        try {
            const json = JSON.stringify(saveData);
            localStorage.setItem(this.prefix + slotId, json);
            console.log(`Game Saved to Slot ${slotId}!`);
            this.game.showNotification(`Game Saved to Slot ${slotId}!`);
            return true;
        } catch (e) {
            console.error("Failed to save game:", e);
            this.game.showNotification("Failed to save game: " + e.message, 4000);
            return false;
        }
    }

    load(slotId) {
        const json = localStorage.getItem(this.prefix + slotId);
        if (!json) {
            this.game.showNotification("Save data not found.");
            return false;
        }

        try {
            const saveData = JSON.parse(json);
            this._restoreSaveData(saveData);

            console.log(`Game Loaded from Slot ${slotId}!`);
            this.game.showNotification(`Game Loaded from Slot ${slotId}!`);
            return true;

        } catch (e) {
            console.error("Failed to load game:", e);
            this.game.showNotification("Failed to load game: " + e.message, 4000);
            return false;
        }
    }

    delete(slotId) {
        localStorage.removeItem(this.prefix + slotId);
        this.game.showNotification(`Slot ${slotId} deleted.`);
    }
}
