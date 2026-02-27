# ProxyOffice

A point-and-click adventure game engine built with vanilla web technologies (HTML/CSS/JS) and wrapped in Electron.

## Overview
This repository contains the core game engine for **ProxyOffice**. The game logic, scene rendering, dialogue system, and inventory management are all written in pure JavaScript and CSS, making it lightweight and easily portable to web or mobile devices in the future. Electron is used to package the game as a native desktop application (for Steam compatibility).

## Running the Game Locally

To download and run this game on your own machine, follow these steps:

### Prerequisites
You will need to have [Node.js](https://nodejs.org/) installed on your computer. 
*We recommend the LTS (Long Term Support) version.*

### Installation Steps

1. **Clone the repository**
   Open your terminal/command prompt and run:
   ```bash
   git clone https://github.com/JSegoviax/ProxyOffice.git
   ```

2. **Navigate to the project folder**
   ```bash
   cd ProxyOffice
   ```

3. **Install the dependencies**
   This will download Electron and prepare the project.
   ```bash
   npm install
   ```

4. **Start the game**
   This command will launch the game in a native Electron desktop window.
   ```bash
   npm start
   ```

## Engine Features
*   **Scene Management:** Dynamic loading of background environments and interactive hitboxes (`src/engine.js`).
*   **Dialogue System:** A full dialogue UI with branching choice support.
*   **Inventory Logic:** Item collection, rendering, and logic-gating (e.g., needing a Proxy Card to unlock a door).
*   **Responsive Scaling:** The game container automatically letterboxes and scales to fit the player's window, preserving the aspect ratio.
