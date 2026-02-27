// Core Game Engine Logic

class GameEngine {
    constructor() {
        this.container = document.getElementById('game-container');
        this.sceneLayer = document.getElementById('scene-layer');
        this.dialogueBox = document.getElementById('dialogue-box');
        this.dialogueText = document.getElementById('dialogue-text');
        this.dialogueChoices = document.getElementById('dialogue-choices');
        this.inventoryBar = document.getElementById('inventory-bar');

        this.baseWidth = 1024;
        this.baseHeight = 768;
        this.currentScene = null;
        this.inventory = [];

        this.init();
    }

    init() {
        this.handleResize();
        window.addEventListener('resize', () => this.handleResize());

        // Test scene setup
        this.loadScene({
            name: "Office",
            background: "#3a2e2b", // Temporary color until we have art
            interactables: [
                {
                    id: "computer",
                    x: 400, y: 300, width: 150, height: 120, // Hitbox coordinates (native resolution)
                    name: "Computer",
                    onInteract: () => this.showDialogue("It's an old CRT monitor. The screen is flickering.")
                },
                {
                    id: "door",
                    x: 800, y: 200, width: 150, height: 400,
                    name: "Door",
                    onInteract: () => {
                        if (this.inventory.includes("Proxy Card")) {
                            this.showDialogue("You swipe the Proxy Card... *beep* The door unlocks!");
                        } else {
                            this.showDialogue("The door is locked from the outside. I need a key or a proxy card.");
                        }
                    }
                },
                {
                    id: "proxy_card",
                    x: 200, y: 500, width: 50, height: 30, // Small card
                    name: "Proxy Card",
                    onInteract: (element) => {
                        this.showDialogue("You found a Proxy Card!");
                        this.addItemToInventory("Proxy Card");
                        element.remove(); // Remove from scene visually
                    }
                }
            ]
        });
    }

    addItemToInventory(itemName) {
        if (!this.inventory.includes(itemName)) {
            this.inventory.push(itemName);
            this.updateInventoryRender();
        }
    }

    updateInventoryRender() {
        this.inventoryBar.innerHTML = '';
        this.inventory.forEach(item => {
            const div = document.createElement('div');
            div.className = 'inventory-item';
            div.innerText = item;
            div.title = item;
            this.inventoryBar.appendChild(div);
        });
    }

    // Ensures the game container maintains aspect ratio 
    // and scales to fit the window (important for mobile porting later)
    handleResize() {
        const scale = Math.min(
            window.innerWidth / this.baseWidth,
            window.innerHeight / this.baseHeight
        );
        this.container.style.transform = `scale(${scale})`;
    }

    loadScene(sceneData) {
        this.currentScene = sceneData;
        this.sceneLayer.innerHTML = '';

        // Set background
        if (sceneData.background.startsWith('#') || sceneData.background.startsWith('rgb')) {
            this.sceneLayer.style.backgroundColor = sceneData.background;
            this.sceneLayer.style.backgroundImage = 'none';
        } else {
            this.sceneLayer.style.backgroundImage = `url('${sceneData.background}')`;
        }

        // Render interactable hitboxes
        if (sceneData.interactables) {
            sceneData.interactables.forEach(item => {
                const div = document.createElement('div');
                div.className = 'interactable';
                div.style.left = `${item.x}px`;
                div.style.top = `${item.y}px`;
                div.style.width = `${item.width}px`;
                div.style.height = `${item.height}px`;
                div.title = item.name; // Tooltip on hover

                div.addEventListener('click', () => {
                    if (item.onInteract) item.onInteract(div);
                });

                this.sceneLayer.appendChild(div);
            });
        }
    }

    showDialogue(text, choices = []) {
        this.dialogueBox.classList.remove('hidden');
        this.dialogueText.innerText = text;
        this.dialogueChoices.innerHTML = '';

        if (choices.length > 0) {
            choices.forEach(choice => {
                const btn = document.createElement('button');
                btn.innerText = choice.text;
                btn.addEventListener('click', () => {
                    this.hideDialogue();
                    if (choice.action) choice.action();
                });
                this.dialogueChoices.appendChild(btn);
            });
        } else {
            // Click anywhere to continue/close if no choices
            const continueBtn = document.createElement('button');
            continueBtn.innerText = "(Click to continue)";
            continueBtn.addEventListener('click', () => this.hideDialogue());
            this.dialogueChoices.appendChild(continueBtn);
        }
    }

    hideDialogue() {
        this.dialogueBox.classList.add('hidden');
    }
}

// Boot the engine when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
    window.game = new GameEngine();
});
