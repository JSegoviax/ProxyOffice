// Dialogue System
// Handles parsing JSON conversation trees and displaying them via the GameEngine

class DialogueSystem {
    constructor(engine) {
        this.engine = engine;
        this.dialogueData = null;
        this.currentNPC = null;
        this.currentNodeId = null;
    }

    async loadDialogue(dataPath = 'data/dialogue.json') {
        try {
            const response = await fetch(dataPath);
            this.dialogueData = await response.json();
            console.log("Dialogue loaded successfully!", this.dialogueData);
        } catch (error) {
            console.error("Failed to load dialogue JSON:", error);
        }
    }

    // Start a conversation with a specific NPC at a specific node
    startConversation(npcId, startNode = 'start') {
        if (!this.dialogueData || !this.dialogueData[npcId]) {
            console.error(`Dialogue not found for NPC: ${npcId}`);
            return;
        }

        this.currentNPC = npcId;
        this.renderNode(startNode);
    }

    renderNode(nodeId) {
        if (nodeId === 'END') {
            this.engine.hideDialogue();
            this.currentNPC = null;
            this.currentNodeId = null;
            return;
        }

        const nodeData = this.dialogueData[this.currentNPC][nodeId];
        if (!nodeData) {
            console.error(`Dialogue node '${nodeId}' not found for NPC '${this.currentNPC}'`);
            this.engine.hideDialogue();
            return;
        }

        this.currentNodeId = nodeId;

        // Map the JSON choices to the format expected by the engine's showDialogue method
        const choices = (nodeData.choices || []).map(choice => {
            return {
                text: choice.text,
                action: () => {
                    // Check if this choice triggers an event
                    if (choice.event) {
                        this.handleEvent(choice.event);
                    }
                    // Progress the conversation
                    this.renderNode(choice.next);
                }
            };
        });

        this.engine.showDialogue(nodeData.text, choices);
    }

    // Handle special events triggered by dialogue choices (like receiving items)
    handleEvent(eventName) {
        console.log("Dialogue Event Triggered:", eventName);
        switch (eventName) {
            case 'give_hat':
                this.engine.addItemToInventory("Party Hat");
                // Update the NPC dialogue tree so they don't give it again
                this.dialogueData.hr_bot.start.choices = [
                    { text: "Take the hat.", next: "already_has_hat" }
                ];
                break;
            case 'give_notes':
                this.engine.addItemToInventory("Post-it Notes");
                // Update Jim so he waits for you to use them
                this.dialogueData.jim.start.choices = [
                    { text: "Have you put the note on Carl yet?", next: "waiting_for_car" }
                ];
                break;
            case 'qa_complete':
                // Set a global flag or update the dialogue so you can't QA it again
                this.dialogueData.proxybot_qa.start = {
                    text: "The bot hums quietly, its screen displaying a green checkmark.",
                    choices: [
                        { text: "Leave it alone.", next: "END" }
                    ]
                };

                // If Jim is waiting for QA, update his dialogue
                if (this.dialogueData.jim.start.choices[0].next === 'qa_proxybot' || this.dialogueData.jim.start.choices[0].next === "waiting_for_car") {
                    this.dialogueData.jim.start.text = "Jim is staring blankly at his monitor. 'Thanks for testing the bot. I might actually get to go home today.'";
                    this.dialogueData.jim.start.choices = [
                        { text: "No problem.", next: "END" }
                    ];
                }
                break;
        }
    }
}
