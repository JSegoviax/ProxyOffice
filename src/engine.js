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
        this.dialogueSystem = new DialogueSystem(this);

        this.init();
    }

    async init() {
        this.handleResize();
        window.addEventListener('resize', () => this.handleResize());

        await this.dialogueSystem.loadDialogue();

        // Test scene setup with Part 1 characters
        this.loadScene({
            name: "Office",
            background: "#3a2e2b", // Temporary color until we have art
            interactables: [
                {
                    id: "carlbot",
                    x: 200, y: 300, width: 150, height: 200,
                    name: "Carlbot",
                    onInteract: () => this.dialogueSystem.startConversation('carlbot')
                },
                {
                    id: "hr_bot",
                    x: 600, y: 400, width: 100, height: 200,
                    name: "HR Bot",
                    onInteract: () => this.dialogueSystem.startConversation('hr_bot')
                },
                {
                    id: "jim",
                    x: 800, y: 300, width: 120, height: 250,
                    name: "Jim",
                    onInteract: () => this.dialogueSystem.startConversation('jim')
                },
                {
                    id: "proxybot",
                    x: 850, y: 550, width: 100, height: 150,
                    name: "Proxybot",
                    onInteract: () => this.dialogueSystem.startConversation('proxybot_qa')
                },
                {
                    id: "corporate_call",
                    x: 450, y: 150, width: 200, height: 120,
                    name: "Corporate Monitor",
                    onInteract: () => this.dialogueSystem.startConversation('corporate_call')
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

                const triggerInteract = (e) => {
                    if (e.type === 'touchstart') e.preventDefault();
                    if (item.onInteract) item.onInteract(div);
                };
                div.addEventListener('click', triggerInteract);
                div.addEventListener('touchstart', triggerInteract, { passive: false });

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
                const triggerChoice = (e) => {
                    if (e.type === 'touchstart') e.preventDefault();
                    this.hideDialogue();
                    if (choice.action) choice.action();
                };
                btn.addEventListener('click', triggerChoice);
                btn.addEventListener('touchstart', triggerChoice, { passive: false });
                this.dialogueChoices.appendChild(btn);
            });
        } else {
            // Click anywhere to continue/close if no choices
            const continueBtn = document.createElement('button');
            continueBtn.innerText = "(Click to continue)";
            const triggerContinue = (e) => {
                if (e.type === 'touchstart') e.preventDefault();
                this.hideDialogue();
            };
            continueBtn.addEventListener('click', triggerContinue);
            continueBtn.addEventListener('touchstart', triggerContinue, { passive: false });
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
