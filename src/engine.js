// Core Game Engine Logic

const itemDescriptions = {
    "Party Hat": "A slightly crushed, aggressively festive paper hat. It smells like mandatory fun.",
    "Post-it Notes": "A stack of yellow sticky notes. Useful for labeling things or minor acts of vandalism.",
    "Small Key": "A generic small brass key. Probably opens a desk drawer.",
    "Level 2 Proxy Card": "A slightly shinier ID badge. This should get me out of the main office."
};

const itemCombinations = {
    // Example: "Item1": { "Item2": "NewItem" }
};

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
        this.activeItem = null;
        this.gameState = {};
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
            background: "assets/main_office_background.png",
            interactables: [
                {
                    id: "carlbot",
                    name: "Carlbot",
                    image: "assets/carlbot.png",
                    x: 234, y: 393, width: 156, height: 212,
                    onInteract: (element) => {
                        this.dialogueSystem.startConversation('carlbot', 'start');
                    }
                },
                {
                    id: "hr_bot",
                    name: "HR Bot",
                    image: "assets/hr_bot.png",
                    x: 600, y: 550, width: 104, height: 161,
                    onInteract: (element) => {
                        this.dialogueSystem.startConversation('hr_bot', 'start');
                    }
                },
                {
                    id: "jim",
                    name: "Jim",
                    image: "assets/jim.png",
                    x: 828, y: 440, width: 94, height: 191,
                    onInteract: (element) => {
                        this.dialogueSystem.startConversation('jim', 'start');
                    }
                },
                {
                    id: "corporate_call",
                    name: "Corporate Monitor",
                    image: "assets/corporate_monitor.png",
                    x: 540, y: 150, width: 122, height: 181,
                    onInteract: (element) => {
                        this.dialogueSystem.startConversation('corporate_call', 'start');
                    }
                },
                {
                    id: "proxybot",
                    name: "Proxybot QC",
                    image: "assets/proxybot.png",
                    x: 878, y: 700, width: 100, height: 151,
                    onInteract: (element) => {
                        this.dialogueSystem.startConversation('proxybot_qa', 'start');
                    }
                },
                {
                    id: "jims_locked_drawer",
                    name: "Locked Drawer",
                    x: 280, y: 700, width: 80, height: 50,
                    onInteract: (element) => {
                        if (this.gameState.drawerUnlocked) {
                            if (this.gameState.takenCard) {
                                this.showDialogue("The drawer is empty. Just some old pens and despair.");
                            } else {
                                this.showDialogue("You open the drawer and grab the Level 2 Proxy Card!");
                                this.addItemToInventory("Level 2 Proxy Card");
                                this.gameState.takenCard = true;
                            }
                        } else {
                            this.showDialogue("It's a locked drawer. Looks like it needs a small key.");
                        }
                    },
                    onItemUse: (item) => {
                        if (item === "Small Key") {
                            if (!this.gameState.drawerUnlocked) {
                                this.showDialogue("You unlocked Jim's drawer!");
                                this.gameState.drawerUnlocked = true;
                                return true; // Used successfully
                            } else {
                                this.showDialogue("It's already unlocked.");
                                return false;
                            }
                        }
                        return false; // Not the right item
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
            if (this.activeItem === item) {
                div.classList.add('active');
            }
            div.innerText = item;
            div.title = item;

            // Left click: Select, Deselect, or Combine
            const handleItemClick = (e) => {
                if (e.type === 'touchstart') e.preventDefault();

                if (this.activeItem === item) {
                    // Deselect
                    this.activeItem = null;
                } else if (this.activeItem !== null && this.activeItem !== item) {
                    // Attempt Combination
                    const combo1 = itemCombinations[this.activeItem] && itemCombinations[this.activeItem][item];
                    const combo2 = itemCombinations[item] && itemCombinations[item][this.activeItem];
                    const result = combo1 || combo2;

                    if (result) {
                        this.inventory = this.inventory.filter(i => i !== this.activeItem && i !== item);
                        this.activeItem = null;
                        this.addItemToInventory(result);
                        this.showDialogue(`You combined the items to create: ${result}.`);
                    } else {
                        this.showDialogue("Those items don't seem to fit together.");
                    }
                } else {
                    // Select
                    this.activeItem = item;
                }

                // Update CSS cursor on container
                if (this.activeItem) {
                    this.container.classList.add('item-active');
                } else {
                    this.container.classList.remove('item-active');
                }

                this.updateInventoryRender();
            };

            // Right click: Examine
            const triggerExamine = (e) => {
                e.preventDefault(); // Prevent default browser context menu
                const desc = itemDescriptions[item] || "A mysterious object with no further description.";
                this.showDialogue(desc);
            };

            div.addEventListener('click', handleItemClick);
            div.addEventListener('contextmenu', triggerExamine);

            // For mobile, maybe long-press for examine. For now, just map touch to select.
            div.addEventListener('touchstart', handleItemClick, { passive: false });

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

        // Render interactable hitboxes/images
        if (sceneData.interactables) {
            sceneData.interactables.forEach(item => {
                const element = item.image ? document.createElement('img') : document.createElement('div');
                element.className = 'interactable';
                if (item.image) element.src = item.image;

                element.style.left = `${item.x}px`;
                element.style.top = `${item.y}px`;
                element.style.width = `${item.width}px`;
                element.style.height = `${item.height}px`;
                element.title = item.name; // Tooltip
                // Set up interaction
                const triggerInteract = (e) => {
                    if (e.type === 'touchstart') e.preventDefault();

                    if (this.activeItem) {
                        if (item.onItemUse) {
                            const used = item.onItemUse(this.activeItem);
                            if (used) {
                                // If the item was successfully used, we might consume it or just clear the active state depending on logic.
                                // For now, let's assume the onItemUse handles consumption if necessary, we just deselect.
                                this.activeItem = null;
                                this.container.classList.remove('item-active');
                                this.updateInventoryRender();
                            } else {
                                this.showDialogue(`I can't use the ${this.activeItem} on that.`);
                            }
                        } else {
                            this.showDialogue(`I can't use the ${this.activeItem} on that.`);
                        }
                    } else if (item.onInteract) {
                        item.onInteract(element);
                    }
                };

                element.addEventListener('click', triggerInteract);
                element.addEventListener('touchstart', triggerInteract, { passive: false });

                this.sceneLayer.appendChild(element);
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
