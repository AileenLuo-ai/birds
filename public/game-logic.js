// Add the pterns object at the top of the file
const patterns = {
  worm: {
    1: ["up", "up", "up", "up"],
    2: ["up", "up", "up", "up"],
    3: ["up", "up", "up", "up"],
  },
  stick: {
    1: ["up", "up", "up", "up"],
    2: ["up", "up", "up", "up"],
    3: ["up", "up", "up", "up"],
  },
  egg: {
    1: ["up", "up", "up", "up"],
    2: ["up", "up", "up", "up"],
    3: ["up", "up", "up", "up"],
  },
  birdhouse: {
    1: ["up", "up", "up", "up"],
    2: ["up", "up", "up", "up"],
    3: ["up", "up", "up", "up"],
  },
  nest: {
    1: ["up", "up", "up", "up"],
    2: ["up", "up", "up", "up"],
    3: ["up", "up", "up", "up"],
  },
};

// Game constants
const gameTimeLimit = 35000; // 35 seconds in milliseconds

// Game state variables
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

// Pattern variables
let currentPatternType = "worm"; // default pattern

// Multiplayer state variables
let socket;
let myRole = null;
let myId = null;
let connectedPlayers = new Set();
let currentWord = null;
let isGameOver = false;

// p5.party shared state
let party = {
  timeRemaining: gameTimeLimit,
  gameStartTime: 0,
  isGameActive: false,
  playerWon: false,
  gameState: "START",
  currentLevel: 1,
  instructionCounter: 0,
  selectedRole: "",
  counter: 0,
  final: false,
  playerInputs: [],
  drawPositions: [],
  rightInput: 0,
  wrongInput: 0,
  currentPatternType: "worm",
  directionGameActive: false,
  currentBirdDirection: "right",
};

function resetGameTimer() {
  // Use p5.party's shared state
  party.gameStartTime = millis();
  party.timeRemaining = gameTimeLimit;
  party.isGameActive = true;
  party.playerWon = false;
  console.log("Timer reset, new start time:", party.gameStartTime);
}

// Initialize p5.party connection
function initMultiplayer() {
  // Check if p5.party is loaded
  if (typeof partyConnect === "undefined") {
    console.error(
      "p5.party not loaded! Make sure the script is included in your HTML file."
    );
    return;
  }

  // Connect to the p5.party demo server
  partyConnect(
    "wss://demoserver.p5party.org",
    "luoai_lovebirds" // Using your name to make it unique
  );

  // Update timer every second
  setInterval(() => {
    if (party.isGameActive) {
      const currentTime = millis();
      const elapsedTime = currentTime - party.gameStartTime;
      party.timeRemaining = max(0, gameTimeLimit - elapsedTime);

      if (party.timeRemaining <= 0) {
        party.isGameActive = false;
      }
    }
  }, 1000);
}

// Initialize the direction game
function initDirectionGame() {
  party.directionGameActive = false;
  party.playerInputs = [];
  party.drawPositions = [];
  party.playerWon = false;
  party.currentBirdDirection = "right";
  resetGameTimer();

  // Generate random pattern type
  const patternTypes = Object.keys(patterns);
  party.currentPatternType =
    patternTypes[Math.floor(Math.random() * patternTypes.length)];
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
    party.currentBirdDirection = "left";
  } else if (keyCode === RIGHT_ARROW) {
    direction = "right";
    party.currentBirdDirection = "right";
  } else if (keyCode === UP_ARROW) {
    direction = "up";
    party.currentBirdDirection = "up";
  } else if (keyCode === DOWN_ARROW) {
    direction = "down";
    party.currentBirdDirection = "down";
  } else {
    return; // Ignore non-arrow keys
  }

  // Add this input to player's sequence
  party.playerInputs.push(direction);

  // Get the current level's pattern
  const currentLevel =
    party.gameState === "PLAY" ? 1 : party.gameState === "LEVEL 2" ? 2 : 3;
  const currentPattern = patterns[party.currentPatternType][currentLevel];

  // Check if this input matches the expected pattern
  let currentIndex = party.playerInputs.length - 1;
  if (direction === currentPattern[currentIndex]) {
    // Correct input, draw the corresponding bird
    party.drawPositions.push(direction);
    party.rightInput++;
  } else {
    // Incorrect input, draw an X
    party.drawPositions.push(direction);
    party.wrongInput++;
  }

  // Check if we've reached the end of the pattern
  if (party.playerInputs.length === currentPattern.length) {
    party.rightInput = 0;

    if (party.wrongInput === 0) {
      // All inputs were correct - move to next level
      party.playerWon = true;
    } else {
      // Reset the game if any inputs were wrong
      setTimeout(() => {
        party.playerInputs = [];
        party.drawPositions = [];
        party.wrongInput = 0;
        party.currentBirdDirection = "right";
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
    let seconds = floor(party.timeRemaining / 1000);

    // Check time's up condition
    if (party.timeRemaining <= 0) {
      // Time's up - display lose background
      imageMode(CORNER);
      image(assets.backgrounds.lose, 0, 0, 720, 513);
      fill(255);
      textSize(36);
      text("TIME'S UP!", width / 2, height - 72);
      textSize(24);
      resetButton.draw();

      // Notify other player of game over
      socket.emit("gameOver", { reason: "timeout" });
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

// Update the mousePressed function to use party state
function mousePressed() {
  // Strong debounce protection
  const currentTime = millis();
  if (currentTime - lastClickTime < CLICK_DELAY) {
    console.log("Debounced click - too soon after last click");
    return;
  }
  lastClickTime = currentTime;

  if (nextButton.isClicked()) {
    party.instructionCounter++;
  }

  // Start button - only in START state
  if (party.gameState === "START" && instructionButton.isClicked()) {
    party.gameState = "INSTRUCTION";
    console.log("Changed to INSTRUCTION state");
  }

  // Start button - only in START state
  if (
    party.gameState === "INSTRUCTION" &&
    playButton.isClicked() &&
    party.instructionCounter === 5
  ) {
    party.gameState = "SELECT";
  }

  // DISABLE CLICKS: If we're in the male bird direction game and it's active
  if (
    party.gameState === "PLAY" &&
    party.selectedRole === "MALE_BIRD" &&
    party.final &&
    party.directionGameActive
  ) {
    return;
  }

  // Start button - only in START state
  if (party.gameState === "START" && startButton && startButton.isClicked()) {
    party.gameState = "SELECT";
    return;
  }

  // Character Selection - only in SELECT state
  if (party.gameState === "SELECT") {
    // Wingman selection
    if (
      mouseX > 200 - 120 &&
      mouseX < 200 + 120 &&
      mouseY > 320 - 120 &&
      mouseY < 320 + 120
    ) {
      party.selectedRole = "WINGMAN";
      party.gameState = "PLAY";
      party.counter = 0;
      party.final = false;
      return;
    }

    // Male bird selection
    if (
      mouseX > 480 - 120 &&
      mouseX < 480 + 120 &&
      mouseY > 320 - 120 &&
      mouseY < 320 + 120
    ) {
      party.selectedRole = "MALE_BIRD";
      party.gameState = "PLAY";
      party.counter = 0;
      party.final = false;
      return;
    }
    return;
  }

  // PLAY state button handling
  if (party.gameState === "PLAY") {
    if (party.selectedRole === "MALE_BIRD") {
      if (continueButton && continueButton.isClicked()) {
        party.counter++;
        console.log("counter", party.counter);
      }

      if (party.counter > 0) {
        party.final = true;
      }
    }

    if (party.selectedRole === "WINGMAN") {
      if (!party.final && continueButton && continueButton.isClicked()) {
        party.counter++;
        if (party.counter > 2) {
          party.final = true;
        }
        return;
      }
    }
  }

  // Global reset check
  if (
    (party.selectedRole === "MALE_BIRD" &&
      resetButton &&
      resetButton.isClicked()) ||
    (party.selectedRole === "WINGMAN" &&
      wingmanResetButton &&
      wingmanResetButton.isClicked())
  ) {
    console.log("Reset button clicked");
    handleReset();
  }
}

// Update the handleReset function to use party state
function handleReset() {
  party.gameState = "START";
  party.currentLevel = 1;
  party.instructionCounter = 0;
  party.selectedRole = "";
  party.counter = 0;
  party.final = false;
  party.playerWon = false;
  party.directionGameActive = false;
  party.playerInputs = [];
  party.drawPositions = [];
  party.wrongInput = 0;
  party.currentBirdDirection = "right";
  resetGameTimer();
}

function drawWingmanScreen() {
  imageMode(CORNER);
  image(assets.backgrounds.forest, 0, 0, 720, 513);
  // Only draw the title if we're not in the final state
  titleComponent(assets.signs.how, 320, 48);

  if (counter === 0) {
    centerCard(assets.cards.female);
    continueButton.draw();
  } else if (counter === 1) {
    centerCard(assets.cards.wingman);
    continueButton.draw();
  } else if (counter === 2) {
    centerCard(assets.cards.dance); // Or use a different card if needed
    continueButton.draw();
  }

  console.log("party.currentLevel", party.currentLevel);

  // Draw background based on current level
  if (party.currentLevel === 1) {
    imageMode(CORNER);
    image(assets.backgrounds.wing1, 0, 0, 720, 513);
    nextButton.draw();
  } else if (party.currentLevel === 2) {
    imageMode(CORNER);
    image(assets.backgrounds.wing2, 0, 0, 720, 513);
    nextButton.draw();
  } else if (party.currentLevel === 3) {
    imageMode(CORNER);
    image(assets.backgrounds.wing3, 0, 0, 720, 513);
    nextButton.draw();
  }

  // Draw continue button if in final state
  if (final) {
    continueButton.draw();
  }

  // Draw the pattern based on the current pattern type
  if (currentPatternType && assets.patterns[currentPatternType]) {
    // Center the pattern image
    const patternImage = assets.patterns[currentPatternType];
    const x = width / 2 + 118;
    const y = height / 2 - 72;
    image(patternImage, x, y, 72, 72);
  }

  // Draw synced timer using p5.party shared state
  textFont(assets.fonts.bodyText);
  textSize(24);
  fill(255);
  textAlign(CENTER);
  text(`Time: ${ceil(party.timeRemaining / 1000)}s`, width / 2 + 128, 128);

  // Check for game over using p5.party shared state
  if (!party.isGameActive || party.timeRemaining <= 0) {
    // Game over - show lose screen
    image(assets.backgrounds.lose, 0, 0, width, height);
    wingmanResetButton.draw();
    return;
  }

  // Check if male bird won using p5.party shared state
  if (party.playerWon) {
    // Show win screen based on party.gameState
    if (party.gameState === "PLAY") {
      image(assets.backgrounds.win, 0, 0, width, height);
    } else if (party.gameState === "LEVEL 2") {
      image(assets.backgrounds.win2, 0, 0, width, height);
    } else if (party.gameState === "LEVEL 3") {
      image(assets.backgrounds.win3, 0, 0, width, height);
    }
    lvlButton.draw();
    return;
  }

  // Add restart button at the bottom
  wingmanResetButton.draw();
}

// Update the draw function to use party.gameState
function draw() {
  // Try to play background music if it's loaded
  // assets.sounds.backgroundMusic.loop();
  // Default sky blue background until assets are ready
  background(135, 206, 235);
  image(assets.backgrounds.forest, 0, 0, 720, 513);

  switch (party.gameState) {
    case "START":
      drawStartScreen();
      break;
    case "SELECT":
      drawCharacterSelect();
      break;
    case "PLAY":
      drawGame();
      break;
    case "INSTRUCTION":
      instructionScreen();
      break;
    case "LEVEL 2":
      drawLevel2Screen();
      break;
    case "LEVEL 3":
      drawLevel3Screen();
      break;
  }
}

// Update the keyPressed function to use party.gameState
function keyPressed() {
  // Only process key events for the direction game
  if (
    (party.selectedRole === "MALE_BIRD" &&
      party.directionGameActive &&
      party.gameState === "PLAY") ||
    party.gameState === "LEVEL 2" ||
    party.gameState === "LEVEL 3"
  ) {
    handleDirectionGameKeyPress(keyCode);
  }

  // Prevent default behavior for arrow keys to avoid scrolling
  if (
    keyCode === UP_ARROW ||
    keyCode === DOWN_ARROW ||
    keyCode === LEFT_ARROW ||
    keyCode === RIGHT_ARROW
  ) {
    return false;
  }
}
