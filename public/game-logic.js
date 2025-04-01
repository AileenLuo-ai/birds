// Add the patterns object at the top of the file
const patterns = {
  worm: {
    1: ["down", "up", "down", "up"],
    2: ["up", "down", "up", "down"],
    3: ["up", "down", "down", "up"],
  },
  stick: {
    1: ["right", "left", "right", "left"],
    2: ["down", "right", "up", "right"],
    3: ["left", "down", "up", "right"],
  },
  egg: {
    1: ["up", "up", "right", "right"],
    2: ["right", "up", "right", "up"],
    3: ["up", "right", "right", "up"],
  },
  birdhouse: {
    1: ["left", "right", "down", "up"],
    2: ["left", "down", "right", "up"],
    3: ["left", "right", "down", "up"],
  },
  nest: {
    1: ["left", "left", "left", "left"],
    2: ["up", "left", "down", "right"],
    3: ["left", "down", "right", "up"],
  },
};

// Game constants
const gameTimeLimit = 35000; // 35 seconds in milliseconds

// Game state variables
let gameState = "START";
let selectedRole = "";
let counter = 0;
let final = false;
let instructionCounter = 0;
let playerWon = false;

// Direction game variables
let gamePattern = ["up", "down", "up", "down"];
let playerInputs = []; // To store the player's inputs
let drawPositions = []; // To store what should be drawn at each position
let directionGameActive = false; // Track if direction game is active
let gameStartTime = 0; // To track when the direction game started
let inputProcessed = false; // To prevent multiple inputs from a single key press
let currentBirdDirection = "right"; // Default direction for the player's bird
let rightInput = 0;
let wrongInput = 0;
let timeRemaining = gameTimeLimit;

// Pattern variables
let levelPatterns = {
  1: "",
  2: "",
  3: "",
};

// Function to randomly select a pattern for a level
function selectPatternForLevel(level) {
  const patternTypes = Object.keys(patterns);
  const randomPattern =
    patternTypes[Math.floor(Math.random() * patternTypes.length)];
  levelPatterns[level] = randomPattern;
  console.log(`Selected pattern for level ${level}: ${randomPattern}`);
}

function resetGameTimer() {
  gameStartTime = millis();
  timeRemaining = gameTimeLimit;
  console.log("Timer reset, new start time:", gameStartTime);
}

// Initialize the direction game
function initDirectionGame() {
  directionGameActive = false;
  playerInputs = [];
  drawPositions = [];
  playerWon = false;
  currentBirdDirection = "right";
  resetGameTimer();
  isGameOver = false;

  // Select patterns for each level if not already selected
  if (!levelPatterns[1]) selectPatternForLevel(1);
  if (!levelPatterns[2]) selectPatternForLevel(2);
  if (!levelPatterns[3]) selectPatternForLevel(3);
}

// Process a single direction input
function processDirectionInput(keyCode) {
  let direction = "";

  // Play hawk screech sound when any arrow key is pressed
  if (assets.sounds.screech && assets.sounds.screech.isLoaded()) {
    assets.sounds.screech.play();
  }

  // Determine which direction was pressed
  if (keyCode === LEFT_ARROW) {
    direction = "left";
    currentBirdDirection = "left";
  } else if (keyCode === RIGHT_ARROW) {
    direction = "right";
    currentBirdDirection = "right";
  } else if (keyCode === UP_ARROW) {
    direction = "up";
    currentBirdDirection = "up";
  } else if (keyCode === DOWN_ARROW) {
    direction = "down";
    currentBirdDirection = "down";
  } else {
    return; // Ignore non-arrow keys
  }

  // Add this input to player's sequence
  playerInputs.push(direction);

  // Get the current level's pattern
  const currentLevel =
    gameState === "PLAY" ? 1 : gameState === "LEVEL 2" ? 2 : 3;
  const currentPatternType = levelPatterns[currentLevel];
  const currentPattern = patterns[currentPatternType][currentLevel];

  // Check if this input matches the expected pattern
  let currentIndex = playerInputs.length - 1;
  if (direction === currentPattern[currentIndex]) {
    // Correct input, draw the corresponding bird
    drawPositions.push(direction);
    rightInput++;
  } else {
    // Incorrect input, draw an X
    drawPositions.push(direction);
    wrongInput++;
  }

  // Check if we've reached the end of the pattern
  if (playerInputs.length === currentPattern.length) {
    rightInput = 0;

    if (wrongInput === 0) {
      // All inputs were correct - move to next level
      playerWon = true;
    } else {
      // Reset the game if any inputs were wrong
      setTimeout(() => {
        playerInputs = [];
        drawPositions = [];
        wrongInput = 0;
        currentBirdDirection = "right";
      }, 500);
    }
  }
}

function drawMeter(meterImage) {
  imageMode(CORNER);
  image(meterImage, width - 96, 48, 72, 424);
}

function handleDirectionGameKeyPress(keyCode) {
  if (directionGameActive && !inputProcessed) {
    let timeElapsed = millis() - gameStartTime;

    if (timeElapsed < gameTimeLimit && !playerWon) {
      // Game is active and not won yet
      if (keyCode === ENTER) {
        // Reset the game if the sequence was wrong
        if (wrongInput > 0) {
          playerInputs = [];
          drawPositions = [];
          wrongInput = 0;
          currentBirdDirection = "right";
          inputProcessed = true;
        }
      } else if (
        (keyCode === LEFT_ARROW ||
          keyCode === RIGHT_ARROW ||
          keyCode === UP_ARROW ||
          keyCode === DOWN_ARROW) &&
        playerInputs.length < gamePattern.length
      ) {
        // Process arrow key input
        processDirectionInput(keyCode);
        inputProcessed = true;
      }
    }
  }
}

// Draw the direction game
function drawDirectionGame(background, winningImage, level) {
  // Draw background and title
  imageMode(CORNER);
  image(background, 0, 0, 720, 513);

  // Draw the pattern based on the current level's pattern type
  const currentPatternType = levelPatterns[level];
  if (currentPatternType && assets.patterns[currentPatternType]) {
    console.log("currentPatternType", currentPatternType);
    // Center the pattern image
    const patternImage = assets.patterns[currentPatternType];
    const x = width / 2 + 48;
    const y = height / 2 - 72;
    image(patternImage, x, y, 48, 48);
  }

  // Check win condition first
  if (playerWon) {
    // Player completed level successfully
    imageMode(CORNER);
    image(winningImage, 0, 0, 720, 513);

    if (level < 3) {
      lvlButton.draw();
    } else {
      resetButton.draw();
    }

    drawMeter(assets.meter.meter5);
    // Reset inputs for next level
    playerInputs = [];
    drawPositions = [];
    rightInput = 0;
    wrongInput = 0;
    return; // Exit early to avoid drawing timer and other game elements
  }

  // Only calculate and show timer during active gameplay
  if (directionGameActive && !playerWon) {
    // Calculate time remaining
    let timeElapsed = millis() - gameStartTime;
    timeRemaining = max(0, gameTimeLimit - timeElapsed);
    let seconds = floor(timeRemaining / 1000);

    // Check time's up condition
    if (timeRemaining <= 0) {
      // Time's up - display lose background
      imageMode(CORNER);
      image(assets.backgrounds.lose, 0, 0, 720, 513);
      fill(255);
      textSize(36);
      text("TIME'S UP!", width / 2, height - 72);
      textSize(24);
      resetButton.draw();
      return;
    }

    // Only display timer during active gameplay
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(24);
    text("Time: " + seconds + "s", width / 2, 96);
  }

  // Draw the meter
  if (rightInput === 0) {
    drawMeter(assets.meter.meter1);
  } else if (rightInput === 1) {
    drawMeter(assets.meter.meter2);
  } else if (rightInput === 2) {
    drawMeter(assets.meter.meter3);
  } else if (rightInput === 3) {
    drawMeter(assets.meter.meter4);
  }

  // Draw the bar image at the bottom of the screen
  imageMode(CENTER);
  image(assets.signs.bar, width / 2, height - 72, 300, 128);

  // Draw the two birds facing each other
  let leftBirdX = width / 3 - 60;
  let birdsY = height / 2 + 32;

  // Position them closer together and lower on screen (on top of the bar)
  let startX = width / 2 - (gamePattern.length * 50) / 2 + 17; // Center the group of icons
  let inputY = height - 54; // Position them at the bar's position

  // Draw the birds or X marks for each input
  for (let i = 0; i < drawPositions.length; i++) {
    let xPos = startX + i * 68; // Closer together (50px spacing)

    if (drawPositions[i] === "left") {
      image(assets.signs.left, xPos - 20, inputY - 20, 40, 40);
    } else if (drawPositions[i] === "right") {
      image(assets.signs.right, xPos - 20, inputY - 20, 40, 40);
    } else if (drawPositions[i] === "up") {
      image(assets.signs.up, xPos - 20, inputY - 20, 40, 40);
    } else if (drawPositions[i] === "down") {
      image(assets.signs.down, xPos - 20, inputY - 20, 40, 40);
    } else if (drawPositions[i] === "x") {
      image(assets.cards.x, xPos - 20, inputY - 20, 40, 40);
    }
  }

  // Reset input processed flag each frame
  inputProcessed = false;
}

function drawLevel2Screen() {
  if (instructionCounter === 0) {
    imageMode(CORNER);
    image(assets.backgrounds.forest, 0, 0, 720, 513);
    instructionSizing(assets.instructions.level2);
    nextButton.draw();
  } else if (instructionCounter === 1) {
    if (!directionGameActive) {
      directionGameActive = true;
      resetGameTimer();
      playerInputs = [];
      drawPositions = [];
      rightInput = 0;
      wrongInput = 0;
    }
    imageMode(CORNER);
    image(assets.backgrounds.play2, 0, 0, 720, 513);
    drawDirectionGame(assets.backgrounds.play2, assets.backgrounds.win2, 2);
  }
}

function drawLevel3Screen() {
  if (instructionCounter === 0) {
    imageMode(CORNER);
    image(assets.backgrounds.forest, 0, 0, 720, 513);
    instructionSizing(assets.instructions.level3);
    nextButton.draw();
  } else if (instructionCounter === 1) {
    if (!directionGameActive) {
      directionGameActive = true;
      resetGameTimer();
      playerInputs = [];
      drawPositions = [];
      rightInput = 0;
      wrongInput = 0;
    }
    imageMode(CORNER);
    image(assets.backgrounds.play3, 0, 0, 720, 513);
    drawDirectionGame(assets.backgrounds.play3, assets.backgrounds.win3, 3);
  }
}

// Update the mousePressed function for level transitions
function mousePressed() {
  // ... existing code ...

  if (playerWon) {
    if (lvlButton.isClicked() && gameState === "PLAY") {
      gameState = "LEVEL 2";
      instructionCounter = 0;
      directionGameActive = false;
      resetGameTimer();
      playerWon = false;
      // Reset game state for new level
      playerInputs = [];
      drawPositions = [];
      rightInput = 0;
      wrongInput = 0;
    } else if (lvlButton.isClicked() && gameState === "LEVEL 2") {
      gameState = "LEVEL 3";
      instructionCounter = 0;
      directionGameActive = false;
      resetGameTimer();
      playerWon = false;
      // Reset game state for new level
      playerInputs = [];
      drawPositions = [];
      rightInput = 0;
      wrongInput = 0;
    }
  }

  // ... rest of existing code ...
}

// Modify the handleReset function
function handleReset() {
  gameState = "START";
  selectedRole = "";
  counter = 0;
  final = false;
  instructionCounter = 0;
  playerWon = false;
  directionGameActive = false;
  playerInputs = [];
  drawPositions = [];
  wrongInput = 0;
  currentBirdDirection = "right";
  resetGameTimer();
  // Reset level patterns
  levelPatterns = {
    1: "",
    2: "",
    3: "",
  };
}
