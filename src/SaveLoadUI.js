export class SaveLoadUI {
    constructor(game, saveManager) {
        this.game = game;
        this.saveManager = saveManager;
        this.isVisible = false;

        this.container = document.createElement('div');
        this.container.style.position = 'absolute';
        this.container.style.top = '50%';
        this.container.style.left = '50%';
        this.container.style.transform = 'translate(-50%, -50%)';
        this.container.style.width = '700px';
        this.container.style.height = '600px';
        this.container.style.backgroundColor = 'rgba(20, 20, 30, 0.95)';
        this.container.style.border = '2px solid #444';
        this.container.style.borderRadius = '10px';
        this.container.style.display = 'none';
        this.container.style.flexDirection = 'column';
        this.container.style.padding = '20px';
        this.container.style.color = '#eee';
        this.container.style.fontFamily = 'sans-serif';
        this.container.style.zIndex = '1000';
        this.container.style.boxShadow = '0 0 20px rgba(0,0,0,0.8)';

        document.body.appendChild(this.container);

        this.refreshList();
    }

    show() {
        this.isVisible = true;
        this.container.style.display = 'flex';
        this.refreshList();
    }

    hide() {
        this.isVisible = false;
        this.container.style.display = 'none';
    }

    refreshList() {
        this.container.innerHTML = '';

        // Header
        const header = document.createElement('h2');
        header.innerText = 'Data Management';
        header.style.textAlign = 'center';
        header.style.marginTop = '0';
        this.container.appendChild(header);

        // List Container
        const list = document.createElement('div');
        list.style.flex = '1';
        list.style.overflowY = 'auto';
        list.style.marginTop = '10px';
        list.style.border = '1px solid #333';
        list.style.backgroundColor = '#111';
        this.container.appendChild(list);

        // New Save Slot (Always visible at top)
        const newSlot = this.createSlotElement({ id: 'new', summary: 'Create New Save Data', timestamp: null }, true);
        list.appendChild(newSlot);

        // Existing Slots
        const slots = this.saveManager.getSlots();
        slots.forEach(slot => {
            list.appendChild(this.createSlotElement(slot));
        });

        // Close Button
        const closeBtn = document.createElement('button');
        closeBtn.innerText = 'Close';
        closeBtn.style.marginTop = '15px';
        closeBtn.style.padding = '10px';
        closeBtn.style.backgroundColor = '#555';
        closeBtn.style.color = 'white';
        closeBtn.style.border = 'none';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.fontSize = '16px';
        closeBtn.onclick = () => this.hide();
        this.container.appendChild(closeBtn);
    }

    createSlotElement(slot, isNew = false) {
        const item = document.createElement('div');
        item.style.display = 'flex';
        item.style.justifyContent = 'space-between';
        item.style.alignItems = 'center';
        item.style.padding = '15px';
        item.style.borderBottom = '1px solid #333';
        item.style.transition = 'background-color 0.2s';

        item.onmouseover = () => item.style.backgroundColor = '#222';
        item.onmouseout = () => item.style.backgroundColor = 'transparent';

        const info = document.createElement('div');
        if (isNew) {
            info.innerHTML = `<strong>+ New Save</strong>`;
        } else {
            const date = new Date(slot.timestamp).toLocaleString();
            info.innerHTML = `<strong>Slot ${slot.id}</strong><br><span style="font-size: 12px; color: #aaa">${date} - ${slot.summary}</span>`;
        }
        item.appendChild(info);

        const actions = document.createElement('div');
        actions.style.display = 'flex';
        actions.style.gap = '8px';

        // Save Button
        const saveBtn = document.createElement('button');
        saveBtn.innerText = isNew ? 'Save New' : 'Overwrite';
        saveBtn.style.padding = '5px 10px';
        saveBtn.style.cursor = 'pointer';
        saveBtn.style.backgroundColor = isNew ? '#27ae60' : '#f39c12'; // Green for new, Orange for overwrite
        saveBtn.style.color = 'white';
        saveBtn.style.border = 'none';
        saveBtn.style.borderRadius = '3px';

        saveBtn.onclick = (e) => {
            e.stopPropagation();
            console.log("Save button clicked");
            // if (!isNew && !confirm(`Overwrite Slot ${slot.id}?`)) return;

            const id = isNew ? Date.now().toString() : slot.id;
            if (this.saveManager.save(id)) {
                this.refreshList();
                if (isNew) this.game.showNotification("New save created!");
            }
        };
        actions.appendChild(saveBtn);

        if (!isNew) {
            // Load Button
            const loadBtn = document.createElement('button');
            loadBtn.innerText = 'Load';
            loadBtn.style.padding = '5px 10px';
            loadBtn.style.cursor = 'pointer';
            loadBtn.style.backgroundColor = '#2980b9'; // Blue
            loadBtn.style.color = 'white';
            loadBtn.style.border = 'none';
            loadBtn.style.borderRadius = '3px';

            loadBtn.onclick = (e) => {
                e.stopPropagation();
                console.log("Load button clicked for slot", slot.id);
                // if (confirm(`Load Slot ${slot.id}? Unsaved progress will be lost.`)) {
                if (this.saveManager.load(slot.id)) {
                    this.hide();
                }
                // }
            };
            actions.appendChild(loadBtn);

            // Delete Button
            const deleteBtn = document.createElement('button');
            deleteBtn.innerText = 'Delete';
            deleteBtn.style.padding = '5px 10px';
            deleteBtn.style.backgroundColor = '#c0392b'; // Red
            deleteBtn.style.color = 'white';
            deleteBtn.style.border = 'none';
            deleteBtn.style.borderRadius = '3px';
            deleteBtn.style.cursor = 'pointer';
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                console.log("Delete button clicked for slot", slot.id);
                // if (confirm('Are you sure you want to delete this save?')) {
                this.saveManager.delete(slot.id);
                this.refreshList();
                // }
            };
            actions.appendChild(deleteBtn);
        }

        item.appendChild(actions);

        return item;
    }
}
