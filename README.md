# Love Birds - A Game About Connection

Love Birds is an interactive storytelling game where players can choose to play as either a Male Bird trying to perform a mating dance or a Wingman helping another bird find love. The game features character selection, interactive storytelling, and a fun directional dancing minigame.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Game Structure](#game-structure)
- [How to Play](#how-to-play)
- [Controls](#controls)
- [Troubleshooting](#troubleshooting)
- [Credits](#credits)

## Prerequisites

To run Love Birds, you'll need:

- A modern web browser (Chrome, Firefox, or Edge recommended)
- A keyboard with arrow keys
- A mouse or trackpad
- An internet connection (for initial download only)
- A computer with audio capabilities

## Installation

1. **Download the Game Files**
   - Download all game files from the project repository
   - Keep the file structure intact

2. **Set Up a Local Server** 
   

   ```bash
   # First install http-server
   npm install -g http-server

   # Navigate to the game folder
   cd path/to/love-birds

   # Run the server
   http-server
   ```

3. **Open the Game**
   - Open your web browser and navigate to whichever port your server uses
   - The game should start automatically

## Game Structure

The game files should be organized as follows:

```
love-birds/
│
├── index.html           # Main HTML file
├── sketch.js            # Main game code
├── assets.js            # Asset loading and management
│
├── assets/
│   ├── fonts/           # Game fonts
│   ├── images/
│   │   ├── backgrounds/ # Background images
│   │   ├── birds/       # Bird character sprites
│   │   ├── cards/       # Story cards
│   │   ├── direction/   # Directional arrows and X mark
│   │   └── signs/       # UI elements and title
│   │
│   └── sounds/          # Game sounds including background music and screech
│
└── libraries/           # p5.js and other libraries
    ├── p5.js
    ├── p5.sound.js
    └── [other libraries]
```

## How to Play

1. **Start Screen**
   - Click the "START" button to begin the game

2. **Character Selection**
   - Choose to play as either "Wingman" or "Male Bird"
   - Each character has a different storyline

3. **Story Progression**
   - Click the "CONTINUE" button to progress through the story
   - Each character has multiple story cards

4. **Male Bird Dance Game**
   - If you chose Male Bird, you'll eventually reach a dancing minigame
   - Use the arrow keys to perform the correct dance sequence
   - Match the pattern: LEFT, LEFT, RIGHT, DOWN
   - You have 30 seconds to complete the sequence correctly

5. **Restart**
   - Use the "RESTART" button at the end of either storyline to return to character selection

## Controls

- **Mouse**
  - Click buttons to navigate through the game
  - Select characters
  - Restart the game

- **Keyboard**
  - Arrow Keys (↑, ↓, ←, →): Control the Male Bird's dance directions
  - Enter: Reset the dance sequence after a mistake or when time expires

## Troubleshooting

**Audio Issues**
- Make sure your browser allows audio playback
- If sounds don't play, check your system volume
- Try refreshing the page if audio stops working

**Game Not Loading**
- Verify all files are in the correct directories
- Check browser console for any JavaScript errors
- Make sure you're running the game from a web server, not just opening the HTML file directly

**Performance Issues**
- Close other browser tabs or applications
- Refresh the page if the game becomes sluggish

## Credits

- Artwork and Design: [Your Name/Team]
- Programming: [Your Name/Team]
- Sound Effects: [Sources]
- Libraries Used: p5.js, p5.sound.js

---

© [Year] [Your Name/Organization]. All rights reserved.
