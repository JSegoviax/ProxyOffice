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
        this.tooltip = document.getElementById('custom-tooltip');

        this.baseWidth = 1024;
        this.baseHeight = 768;
        this.currentScene = null;
        this.inventory = [];
        this.activeItem = null;
        this.gameState = {
            proxyLevel: 1, // Baseline level
            synergyPoints: 0 // Used to unlock perks and levels in the Company Store
        };
        this.dialogueSystem = new DialogueSystem(this);
        this.minigame = new MinigameSystem(this);

        this.init();
    }

    async init() {
        this.handleResize();
        window.addEventListener('resize', () => this.handleResize());

        // Prevent default context menu everywhere
        document.addEventListener('contextmenu', event => event.preventDefault());

        // Skip point-and-click scene loading and boot directly into ProxyOS minigame hub
        this.minigame.bootOS();
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

                // Custom tooltip implementation
                const triggerHover = (e) => {
                    this.tooltip.classList.remove('hidden');
                    let actionText = item.actionText || "Interact";

                    if (this.activeItem) {
                        actionText = `Use ${this.activeItem}`;
                    }

                    this.tooltip.innerHTML = `[ Look | ${actionText} ]`;
                };

                const triggerMove = (e) => {
                    const rect = this.container.getBoundingClientRect();
                    const scale = rect.width / this.baseWidth;

                    let x = (e.clientX - rect.left) / scale + 15;
                    let y = (e.clientY - rect.top) / scale + 15;

                    if (x > this.baseWidth - 250) x = x - 270;
                    if (y > this.baseHeight - 100) y = y - 100;

                    this.tooltip.style.left = `${x}px`;
                    this.tooltip.style.top = `${y}px`;
                };

                const triggerLeave = (e) => {
                    this.tooltip.classList.add('hidden');
                };

                element.addEventListener('mouseenter', triggerHover);
                element.addEventListener('mousemove', triggerMove);
                element.addEventListener('mouseleave', triggerLeave);

                // Right click -> Look
                const triggerLook = (e) => {
                    e.preventDefault(); // Prevent context menu
                    if (e.type === 'touchstart') return; // Mobile touch maps to interact directly below
                    const desc = item.description || "You see nothing special.";
                    this.showDialogue(desc);
                };

                // Left click -> Interact or Use Item
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
                element.addEventListener('contextmenu', triggerLook);
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

    addSP(amount) {
        this.gameState.synergyPoints += amount;

        // Visual notification of SP gain
        const notification = document.createElement('div');
        notification.className = 'sp-notification';
        notification.innerText = `+${amount} SP`;
        notification.style.position = 'absolute';
        notification.style.left = '50%';
        notification.style.top = '40%';
        notification.style.transform = 'translate(-50%, -50%)';
        notification.style.color = '#4af626';
        notification.style.fontWeight = 'bold';
        notification.style.fontSize = '24px';
        notification.style.textShadow = '0 0 5px #4af626';
        notification.style.zIndex = '2000';
        notification.style.transition = 'all 2s ease-out';
        notification.style.pointerEvents = 'none';

        this.container.appendChild(notification);

        // Animate floating up and fading out
        requestAnimationFrame(() => {
            notification.style.top = '30%';
            notification.style.opacity = '0';
        });

        setTimeout(() => {
            notification.remove();
        }, 2000);

        // If the minigame is active, hopefully it can listen or look up this value to update its own UI.
    }
}

// Boot the engine when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
    window.game = new GameEngine();
});
