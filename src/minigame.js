class MinigameSystem {
    constructor(engine) {
        this.engine = engine;

        // DOM Elements
        this.overlay = document.getElementById('minigame-overlay');
        this.statusText = document.getElementById('minigame-status');
        this.clusterArea = document.getElementById('data-cluster-area');
        this.progressFill = document.getElementById('minigame-progress-fill');
        this.bins = document.querySelectorAll('.bin');
        this.logoffBtn = document.getElementById('minigame-logoff');

        // Game State
        this.isActive = false;
        this.targetScore = 12; // Total blocks needed
        this.currentScore = 0;
        this.dataTypes = ['compliance', 'optimization', 'disruption', 'redundancy'];

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.logoffBtn.addEventListener('click', () => this.stop());

        this.bins.forEach(bin => {
            bin.addEventListener('dragover', (e) => {
                e.preventDefault(); // Must prevent default to allow drop
                bin.classList.add('drag-over');
            });

            bin.addEventListener('dragleave', () => {
                bin.classList.remove('drag-over');
            });

            bin.addEventListener('drop', (e) => {
                e.preventDefault();
                bin.classList.remove('drag-over');

                const blockId = e.dataTransfer.getData('text/plain');
                const block = document.getElementById(blockId);

                if (!block) return;

                const expectedType = bin.dataset.type;
                const actualType = block.dataset.type;

                if (expectedType === actualType) {
                    // Correct bin
                    block.remove();
                    this.incrementProgress();
                } else {
                    // Incorrect bin
                    bin.classList.add('error');
                    setTimeout(() => bin.classList.remove('error'), 500);
                }
            });
        });
    }

    start() {
        this.isActive = true;
        this.currentScore = 0;
        this.progressFill.style.width = '0%';
        this.overlay.classList.remove('hidden');
        this.statusText.innerText = "AWAITING INPUT... FILE: PROXY-01";
        this.generateDataCluster();
    }

    stop() {
        this.isActive = false;
        this.overlay.classList.add('hidden');
        this.clusterArea.innerHTML = '';
        this.engine.showDialogue("You log off the terminal.");
    }

    generateDataCluster() {
        this.clusterArea.innerHTML = '';

        // Generate enough blocks to hit the target score
        for (let i = 0; i < this.targetScore; i++) {
            const block = document.createElement('div');
            block.className = 'data-block';
            block.id = 'data-block-' + i;

            // Random Type
            const type = this.dataTypes[Math.floor(Math.random() * this.dataTypes.length)];
            block.dataset.type = type;
            block.classList.add(`type-${type}`);

            // Random Text (Hex code or buzzword)
            block.innerText = this.generateRandomDataString();

            // Random Position
            const x = Math.random() * 80; // % width
            const y = Math.random() * 80; // % height
            block.style.left = `${x}%`;
            block.style.top = `${y}%`;

            // Drag mechanics
            block.draggable = true;
            block.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', block.id);
                // Slight transparency while dragging
                setTimeout(() => block.style.opacity = '0.5', 0);
            });
            block.addEventListener('dragend', () => {
                block.style.opacity = '1';
            });

            this.clusterArea.appendChild(block);
        }
    }

    generateRandomDataString() {
        const buzzwords = ["EGO", "SYNERGY", "MATRIX", "PROTOCOL", "ALIGNMENT", "NODE", "FLUX", "CORE"];
        if (Math.random() > 0.5) {
            return buzzwords[Math.floor(Math.random() * buzzwords.length)];
        } else {
            // Generate Hex
            const hex = Math.floor(Math.random() * 16777215).toString(16).toUpperCase();
            return `0x${hex.padStart(6, '0')}`;
        }
    }

    incrementProgress() {
        this.currentScore++;
        const percent = (this.currentScore / this.targetScore) * 100;
        this.progressFill.style.width = `${percent}%`;

        if (this.currentScore >= this.targetScore) {
            this.handleCompletion();
        }
    }

    handleCompletion() {
        this.statusText.innerText = "EGO CALIBRATED. CLEARANCE UPGRADED.";
        this.clusterArea.innerHTML = ''; // Clear any remaining if we had extra

        // Upgrade the global game state proxy level
        // Standard start is Level 1. This upgrades to Level 2.
        this.engine.gameState.proxyLevel = 2;

        setTimeout(() => {
            this.overlay.classList.add('hidden');
            this.isActive = false;
            this.engine.showDialogue("Your Proxy Card beeped. It feels heavier. Clearance upgraded to Level 2.");
        }, 3000);
    }
}
