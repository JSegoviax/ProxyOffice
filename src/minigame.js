class MinigameSystem {
    constructor(engine) {
        this.engine = engine;

        // DOM Elements - OS Desktop
        this.osOverlay = document.getElementById('os-overlay');
        this.logoffBtn = document.getElementById('os-logoff');
        this.spCounter = document.getElementById('os-sp-counter');
        this.appIcons = document.querySelectorAll('.os-icon');
        this.closeButtons = document.querySelectorAll('.os-btn-close');

        // App Windows
        this.windows = {
            work: document.getElementById('app-window-work'),
            store: document.getElementById('app-window-store'),
            inbox: document.getElementById('app-window-inbox')
        };

        // DOM Elements - Synergy Alignment (Work App)
        this.statusText = document.getElementById('minigame-status');
        this.clusterArea = document.getElementById('data-cluster-area');
        this.bins = document.querySelectorAll('.bin');

        // DOM Elements - Inbox Triage
        this.inboxTimerEl = document.getElementById('inbox-timer');
        this.inboxQuotaEl = document.getElementById('inbox-quota');
        this.inboxPolicyEl = document.getElementById('inbox-active-policy');
        this.inboxEmailCard = document.getElementById('inbox-email-card');
        this.inboxControls = document.getElementById('inbox-controls');
        this.inboxStartBtn = document.getElementById('btn-inbox-start');
        this.inboxDenyBtn = document.getElementById('btn-inbox-deny');
        this.inboxApproveBtn = document.getElementById('btn-inbox-approve');
        this.inboxSender = document.getElementById('email-sender');
        this.inboxSubject = document.getElementById('email-subject');
        this.inboxBody = document.getElementById('email-body');

        // Store Elements
        this.storeContainer = document.getElementById('store-items-container');

        // Game State - Shared
        this.isActive = false; // Is OS booted

        // Game State - Synergy Alignment
        this.targetScore = 12; // Blocks needed
        this.currentScore = 0;
        this.dataTypes = ['compliance', 'optimization', 'disruption', 'redundancy'];

        // Game State - Inbox Triage
        this.inboxTimer = 60;
        this.inboxTimerInterval = null;
        this.inboxQuota = 0;
        this.inboxTargetQuota = 10;
        this.currentInboxPolicy = null;
        this.currentEmail = null;

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.logoffBtn.addEventListener('click', () => this.stopOS());

        // App Icon Clicking
        this.appIcons.forEach(icon => {
            icon.addEventListener('click', () => {
                this.launchApp(icon.dataset.app);
            });
        });

        // Window Closing
        this.closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeApp(btn.dataset.app);
            });
        });

        // Inbox Triage Setup
        this.inboxStartBtn.addEventListener('click', () => this.beginInboxShift());
        this.inboxDenyBtn.addEventListener('click', () => this.handleInboxSwipe('deny'));
        this.inboxApproveBtn.addEventListener('click', () => this.handleInboxSwipe('approve'));

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

    bootOS() {
        this.isActive = true;
        this.osOverlay.classList.remove('hidden');
        this.updateSPUI();
        // Hide all windows initially
        Object.values(this.windows).forEach(win => win.classList.add('hidden'));
    }

    stopOS() {
        this.isActive = false;
        this.osOverlay.classList.add('hidden');
        this.clusterArea.innerHTML = '';
        this.engine.showDialogue("You log off the terminal and return to your desk.");
    }

    launchApp(appName) {
        if (!this.windows[appName]) return;

        // Hide others (single tasking OS for now)
        Object.values(this.windows).forEach(win => win.classList.add('hidden'));

        // Show selected
        this.windows[appName].classList.remove('hidden');

        // Init specific app logic
        if (appName === 'work') {
            this.startSynergyAlignment();
        } else if (appName === 'store') {
            this.renderStore();
        } else if (appName === 'inbox') {
            this.startInboxTriageApp();
        }
    }

    closeApp(appName) {
        if (this.windows[appName]) {
            this.windows[appName].classList.add('hidden');
            if (appName === 'work') {
                this.clusterArea.innerHTML = ''; // Clear blocks if closed early
            } else if (appName === 'inbox') {
                this.stopInboxShift(); // Cleanup timer
            }
        }
    }

    updateSPUI() {
        this.spCounter.innerText = `SP: ${this.engine.gameState.synergyPoints}`;
    }

    // --- WORK APP: SYNERGY ALIGNMENT ---
    startSynergyAlignment() {
        this.currentScore = 0;
        this.statusText.innerText = "AWAITING INPUT... FILE: PROXY-01";
        this.statusText.style.color = "#4af626";
        this.generateDataCluster();
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

        // Optional: We removed the progress bar from UI for the desktop update,
        // but we can just use the score directly to trigger completion.

        if (this.currentScore >= this.targetScore) {
            this.handleCompletion();
        }
    }

    handleCompletion() {
        this.statusText.innerText = "FILE COMPLETE. +150 SYNERGY POINTS.";
        this.statusText.style.color = "#ffd700"; // Gold
        this.clusterArea.innerHTML = ''; // Clear any remaining if we had extra

        // Award SP to the global economy
        this.engine.addSP(150);
        this.updateSPUI();

        // Close the app window after a delay and return to desktop
        setTimeout(() => {
            this.closeApp('work');
        }, 3000);
    }

    // --- STORE APP ---
    renderStore() {
        this.storeContainer.innerHTML = '';

        const storeItems = [
            { id: 'proxy2', name: 'Level 2 Proxy Card Upgrade', cost: 500, desc: 'Grants access to the Breakroom.' },
            { id: 'coffee', name: 'Premium Coffee Token', cost: 200, desc: 'A real coffee bean was waved over this cup.' },
            { id: 'headphones', name: 'Noise Canceling Headphones', cost: 350, desc: 'Drowns out coworkers.' }
        ];

        storeItems.forEach(item => {
            const el = document.createElement('div');
            el.className = 'store-item';

            const details = document.createElement('div');
            details.className = 'store-item-details';
            details.innerHTML = `<strong>${item.name}</strong><br><span>${item.desc}</span>`;

            const costPanel = document.createElement('div');
            costPanel.style.textAlign = 'right';
            costPanel.innerHTML = `<div class="store-item-cost">${item.cost} SP</div>`;

            const buyBtn = document.createElement('button');
            buyBtn.className = 'btn-buy';
            buyBtn.innerText = 'PURCHASE';

            // Check if affords
            if (this.engine.gameState.synergyPoints < item.cost) {
                buyBtn.disabled = true;
            }

            buyBtn.addEventListener('click', () => {
                this.purchaseItem(item);
            });

            costPanel.appendChild(buyBtn);
            el.appendChild(details);
            el.appendChild(costPanel);

            this.storeContainer.appendChild(el);
        });
    }

    purchaseItem(item) {
        if (this.engine.gameState.synergyPoints >= item.cost) {
            this.engine.gameState.synergyPoints -= item.cost;
            this.updateSPUI();

            // Process specific item logic connecting to main game engine
            if (item.id === 'proxy2') {
                this.engine.gameState.proxyLevel = 2;
                this.engine.inventory.push("Level 2 Proxy Card");
                this.engine.updateInventoryRender();
                this.engine.showDialogue("PURCHASE SUCCESS: Your proxy clearance has been elevated.");
            } else if (item.id === 'coffee') {
                this.engine.inventory.push("Premium Coffee Token");
                this.engine.updateInventoryRender();
                this.engine.showDialogue("PURCHASE SUCCESS: Item printed smoothly via office requisition slot.");
            } else if (item.id === 'headphones') {
                this.engine.inventory.push("Noise Canceling Headphones");
                this.engine.updateInventoryRender();
                this.engine.showDialogue("PURCHASE SUCCESS: A heavy silence falls over you.");
            }

            // Re-render store to update button disabilities
            this.renderStore();
        }
    }

    // --- INBOX TRIAGE APP ---
    startInboxTriageApp() {
        this.inboxStartBtn.classList.remove('hidden');
        this.inboxEmailCard.classList.add('hidden');
        this.inboxControls.classList.add('hidden');
        this.inboxTimerEl.innerText = '60';
        this.inboxQuotaEl.innerText = '0/10';
        this.inboxPolicyEl.innerText = 'AWAITING SHIFT START...';
    }

    beginInboxShift() {
        this.inboxStartBtn.classList.add('hidden');
        this.inboxEmailCard.classList.remove('hidden');
        this.inboxControls.classList.remove('hidden');

        this.inboxTimer = 60;
        this.inboxQuota = 0;
        this.updateInboxUI();

        this.setRandomInboxPolicy();
        this.generateInboxEmail();

        clearInterval(this.inboxTimerInterval);
        this.inboxTimerInterval = setInterval(() => {
            this.inboxTimer--;
            this.inboxTimerEl.innerText = this.inboxTimer;
            if (this.inboxTimer <= 0) {
                this.endInboxShift(false);
            }
            // Add chaos: Shift policy every 15 seconds
            if (this.inboxTimer > 0 && this.inboxTimer % 15 === 0) {
                this.setRandomInboxPolicy();
                // Visual feedback of policy shift
                this.inboxPolicyEl.style.color = '#ff3333';
                setTimeout(() => this.inboxPolicyEl.style.color = '#000', 500);
            }
        }, 1000);
    }

    stopInboxShift() {
        clearInterval(this.inboxTimerInterval);
        this.inboxStartBtn.classList.remove('hidden');
        this.inboxEmailCard.classList.add('hidden');
        this.inboxControls.classList.add('hidden');
    }

    setRandomInboxPolicy() {
        const policies = [
            { id: 'deny_hr', text: 'DENY ALL EMAILS FROM HR', test: (e) => e.sender.includes('HR') ? 'deny' : 'approve' },
            { id: 'approve_urgent', text: 'APPROVE ANY "URGENT" SUBJECTS', test: (e) => e.subject.includes('URGENT') ? 'approve' : 'deny' },
            { id: 'deny_expense', text: 'DENY ALL EXPENSE REPORTS', test: (e) => e.subject.includes('Expense') ? 'deny' : 'approve' },
            { id: 'approve_all', text: 'OVERSIGHT IS DOWN. APPROVE EVERYTHING.', test: (e) => 'approve' }
        ];
        this.currentInboxPolicy = policies[Math.floor(Math.random() * policies.length)];
        this.inboxPolicyEl.innerText = this.currentInboxPolicy.text;
    }

    generateInboxEmail() {
        const senders = ['HR@proxycorp.local', 'Finance@proxycorp.local', 'IT_Support@proxycorp.local', 'Exec_Office@proxycorp.local', 'Gary@proxycorp.local'];
        const subjects = ['URGENT: Required Compliance Training', 'Expense Report: Q3 Staples', 'Team Building Pizza Party', 'URGENT: Server Down', 'Can I expense this plant?'];
        const bodies = ['Please review attached document.', 'Requires immediate sign-off.', 'As per our last email...', 'This is blocking my core workflow.'];

        this.currentEmail = {
            sender: senders[Math.floor(Math.random() * senders.length)],
            subject: subjects[Math.floor(Math.random() * subjects.length)],
            body: bodies[Math.floor(Math.random() * bodies.length)]
        };

        this.inboxSender.innerText = `From: ${this.currentEmail.sender}`;
        this.inboxSubject.innerText = `Subject: ${this.currentEmail.subject}`;
        this.inboxBody.innerText = this.currentEmail.body;

        // Reset card styling
        this.inboxEmailCard.classList.remove('swipe-left', 'swipe-right');
        this.inboxEmailCard.style.transform = '';
        this.inboxEmailCard.style.opacity = '1';
    }

    handleInboxSwipe(action) {
        // Evaluate against policy
        const expectedAction = this.currentInboxPolicy.test(this.currentEmail);

        // Animate Swipe
        if (action === 'deny') {
            this.inboxEmailCard.classList.add('swipe-left');
        } else {
            this.inboxEmailCard.classList.add('swipe-right');
        }

        setTimeout(() => {
            if (action === expectedAction) {
                // Correct
                this.inboxQuota++;
                this.updateInboxUI();
                if (this.inboxQuota >= this.inboxTargetQuota) {
                    this.endInboxShift(true);
                } else {
                    this.generateInboxEmail();
                }
            } else {
                // Incorrect - Time penalty!
                this.inboxTimer -= 5;
                if (this.inboxTimer < 0) this.inboxTimer = 0;
                this.updateInboxUI();

                // Screen flash
                this.windows.inbox.style.borderColor = 'red';
                setTimeout(() => this.windows.inbox.style.borderColor = '#4af626', 300);

                if (this.inboxTimer <= 0) {
                    this.endInboxShift(false);
                } else {
                    this.generateInboxEmail();
                }
            }
        }, 200); // 200ms matches css transition
    }

    updateInboxUI() {
        this.inboxTimerEl.innerText = this.inboxTimer;
        this.inboxQuotaEl.innerText = `${this.inboxQuota}/${this.inboxTargetQuota}`;
    }

    endInboxShift(success) {
        this.stopInboxShift();
        if (success) {
            this.inboxPolicyEl.innerText = 'SHIFT COMPLETE. QUOTA MET. +250 SP.';
            this.inboxPolicyEl.style.color = '#000';
            this.engine.addSP(250);
            this.updateSPUI();
            setTimeout(() => this.closeApp('inbox'), 3000);
        } else {
            this.inboxPolicyEl.innerText = 'SHIFT FAILED. INADEQUATE SYNERGY.';
            this.inboxPolicyEl.style.color = '#ff3333';
        }
    }
}
