// Direction game variables
let gamePattern = ["up", "down", "up", "down"];

let playerInputs = []; // To store the player's inputs
let drawPositions = []; // To store what should be drawn at each position
let directionGameActive = false; // Track if direction game is active
let gameStartTime = 0; // To track when the direction game started
let gameTimeLimit = 35000; // 30 seconds in milliseconds
let playerWon = false; // Track if player has won the direction game
let inputProcessed = false; // To prevent multiple inputs from a single key press
let currentBirdDirection = "right"; // Default direction for the player's bird
let rightInput = 0;
let wrongInput = 0;

// Initialize the direction game
function initDirectionGame() {
  directionGameActive = false;
  playerInputs = [];
  drawPositions = [];
  playerWon = false;
  currentBirdDirection = "right";
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

  // Check if this input matches the expected pattern
  let currentIndex = playerInputs.length - 1;
  if (direction === gamePattern[currentIndex]) {
    // Correct input, draw the corresponding bird
    drawPositions.push(direction);
    rightInput++;
  } else {
    // Incorrect input, draw an X
    drawPositions.push(direction);
    wrongInput++;
  }

  // Check if we've reached 4 inputs
  if (playerInputs.length === 4) {
    rightInput = 0;

    if (wrongInput === 0) {
      // All inputs were correct - move to level 2
      playerWon = true;
      // You might want to add a level variable to track progress
      // level = 2;
    } else {
      // Reset the game if any inputs were wrong
      setTimeout(() => {
        playerInputs = [];
        drawPositions = [];
        wrongInput = 0;
        currentBirdDirection = "right";
      }, 1000); // Wait 1 second before resetting to show the wrong inputs
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

  // Calculate time remaining
  let timeElapsed = millis() - gameStartTime;
  let timeRemaining = max(0, gameTimeLimit - timeElapsed);
  let seconds = floor(timeRemaining / 1000);

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

  // Check win condition first
  if (playerWon) {
    // Player completed level 1 successfully
    imageMode(CORNER);
    image(winningImage, 0, 0, 720, 513);

    if (level < 3) {
      lvlButton.draw();
    } else {
      resetButton.draw();
      return;
    }

    drawMeter(assets.meter.meter5);
    rightInput = 0;
    wrongInput = 0;
    playerInputs = [];
    drawPositions = [];
    currentBirdDirection = "right";
  }

  if (timeRemaining <= 0) {
    // Time's up - display lose background
    imageMode(CORNER);
    image(assets.backgrounds.lose, 0, 0, 720, 513);

    // Add text on top of the lose background if needed
    fill(255);
    textSize(36);
    text("TIME'S UP!", width / 2, height - 72);
    textSize(24);
    resetButton.draw();

    return; // Exit early to avoid drawing other elements
  }

  // Display time remaining
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(24);
  text("Time: " + seconds + "s", width / 2, 96);

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
    imageMode(CORNER);
    image(assets.backgrounds.play3, 0, 0, 720, 513);
    drawDirectionGame(assets.backgrounds.play3, assets.backgrounds.win3, 3);
  }
}
