---
description: Test visual rendering and interactivity in the game UI space
---
# Testing Gameplay UI Workflows 

If you as the browser subagent are instructed to test the gameplay, follow these rules universally:

1. **Wait for Load:** Ensure the main game container and canvas elements are fully loaded before interaction.
2. **Explicit Dialogue Checks:** 
   - ANY time you interact with an NPC or an object intended to open dialogue, YOU MUST verify that the dialogue box AND its nested choices (`<div id="dialogue-choices">`) are structurally visible in the DOM.
   - You must execute clicks on specific dialogue choice buttons (not just clicking randomly on the text box) to verify that state progression fires and new choices load.
3. **Inventory & State Change:** 
   - Verify that items explicitly enter the inventory (`<div id="inventory-bar">`).
   - Select items to test `item-active` state logic and UI cursor changes.
4. **Hitboxes & Coordinates:** The game engine uses absolute positioned floating `div` and `img` elements inside the `#scene-layer`. You can target these specifically by finding their DOM elements or their coordinates.

// turbo-all
