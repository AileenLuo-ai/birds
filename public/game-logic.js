// Direction game variables
let gamePattern = ["left", "left", "right", "down"]; // The expected pattern
let playerInputs = []; // To store the player's inputs
let drawPositions = []; // To store what should be drawn at each position
let directionGameActive = false; // Track if direction game is active
let gameStartTime = 0; // To track when the direction game started
let gameTimeLimit = 30000; // 30 seconds in milliseconds
let playerWon = false; // Track if player has won the direction game
let inputProcessed = false; // To prevent multiple inputs from a single key press
let currentBirdDirection = "right"; // Default direction for the player's bird

// Initialize the direction game
function initDirectionGame() {
  directionGameActive = false;
  playerInputs = [];
  drawPositions = [];
  playerWon = false;
  currentBirdDirection = "right";
}

// Handle key presses for the direction game
// Process a single direction input
function processDirectionInput() {
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

    // Check if the full pattern is complete and correct
    if (playerInputs.length === gamePattern.length) {
      playerWon = true;
    }
  } else {
    // Incorrect input, draw an X
    drawPositions.push("x");
  }
}

function handleDirectionGameKeyPress() {
  if (directionGameActive && !inputProcessed) {
    let timeElapsed = millis() - gameStartTime;

    if (timeElapsed < gameTimeLimit && !playerWon) {
      // Game is active and not won yet
      if (keyCode === ENTER) {
        // Reset the game if the sequence was wrong or player wants to retry
        if (
          drawPositions.length > 0 &&
          drawPositions[drawPositions.length - 1] === "x"
        ) {
          // Reset only the inputs, not the whole game
          playerInputs = [];
          drawPositions = [];
          inputProcessed = true;
        }
      } else if (
        (keyCode === LEFT_ARROW ||
          keyCode === RIGHT_ARROW ||
          keyCode === UP_ARROW ||
          keyCode === DOWN_ARROW) &&
        drawPositions.length < gamePattern.length
      ) {
        // Process arrow key input
        processDirectionInput();
        inputProcessed = true;
      }
    } else if (keyCode === ENTER) {
      // Time's up OR player won, and wants to try again
      directionGameActive = true;
      gameStartTime = millis();
      playerInputs = [];
      drawPositions = [];
      playerWon = false;
      inputProcessed = true;
    }
  }
}

// Draw the direction game
function drawDirectionGame() {
  // Draw background and title
  imageMode(CORNER);
  image(assets.backgrounds.forest, 0, 0, 720, 513);
  titleComponent(assets.signs.level, 196, 48);

  // Calculate time remaining
  let timeElapsed = millis() - gameStartTime;
  let timeRemaining = max(0, gameTimeLimit - timeElapsed);
  let seconds = floor(timeRemaining / 1000);

  // Check win/lose conditions first
  if (playerWon) {
    // Player won - display win background
    imageMode(CORNER);
    image(assets.backgrounds.win, 0, 0, 720, 513);

    // Add restart button on win screen
    resetButton.draw();

    return; // Exit early to avoid drawing other elements
  }

  if (timeRemaining <= 0) {
    // Time's up - display lose background
    imageMode(CORNER);
    image(assets.backgrounds.lose, 0, 0, 720, 513);

    // Add text on top of the lose background if needed
    fill(255);
    textSize(36);
    text("TIME'S UP!", width / 2, height / 2 - 30);
    textSize(24);
    text("Press ENTER to try again", width / 2, height / 2 + 30);

    return; // Exit early to avoid drawing other elements
  }

  // Display time remaining
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(24);
  text("Time: " + seconds + "s", width / 2, 96);

  // Draw the two birds facing each other
  let leftBirdX = width / 3 - 60;
  let rightBirdX = (width / 3) * 2 + 60;
  let birdsY = height / 2 + 32;

  // Draw the right bird (red.png) - always facing left
  imageMode(CENTER);
  image(assets.birds.red, rightBirdX, birdsY, 120, 120);

  // Draw the player's bird with the current direction
  if (currentBirdDirection === "left") {
    image(assets.signs.left, leftBirdX, birdsY, 120, 120);
  } else if (currentBirdDirection === "right") {
    image(assets.signs.right, leftBirdX, birdsY, 120, 120);
  } else if (currentBirdDirection === "up") {
    image(assets.signs.up, leftBirdX, birdsY, 120, 120);
  } else if (currentBirdDirection === "down") {
    image(assets.signs.down, leftBirdX, birdsY, 120, 120);
  }

  // Draw the bar image at the bottom of the screen
  imageMode(CENTER);
  image(assets.signs.bar, width / 2, height - 72, 300, 128);

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

  if (
    drawPositions.length > 0 &&
    drawPositions[drawPositions.length - 1] === "x"
  ) {
    // Wrong sequence, show message to try again
    textSize(24);
    fill("white");
    text("Wrong sequence! Press ENTER to try again", width / 2, height - 148);
    fill(255);
  } else if (drawPositions.length < gamePattern.length) {
    // Still waiting for input
    textSize(20);
    text(
      "Press arrow keys to perform the mating dance that \n your wingman shows you!",
      width / 2,
      height - 148
    );
  }

  // Reset input processed flag each frame
  inputProcessed = false;
}