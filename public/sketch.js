// sketch.js - Main game logic
// Expose gameState to the window so it can be accessed from HTML buttons
window.gameState = "START";
let gameState = window.gameState;
let selectedRole = "";
let startButton;
let continueButton;
let counter = 0;
let final = false;
let lastClickTime = 0;
const CLICK_DELAY = 100;

// Game pattern variables
let gamePattern = ["left", "left", "right", "down"];
let playerInputs = [];
let drawPositions = [];
let directionGameActive = false;
let gameStartTime = 0;
let gameTimeLimit = 30000;
let playerWon = false;
let inputProcessed = false;
let currentBirdDirection = "right";
let resetButton;

function preload() {
  preloadAssets(); // Load assets from assets.js
}

function setup() {
  createCanvas(720, 513);
  textAlign(CENTER, CENTER);

  // Initialize the room manager
  RoomManager.init();

  // Create room on startup
  RoomManager.createRoom();

  // Ensure the button is created AFTER canvas is set up
  startButton = new Button(width / 2, height - 72, 200, 60, "START");
  continueButton = new Button(width / 2, height - 72, 200, 60, "CONTINUE");
  resetButton = new Button(width / 2, height - 72, 200, 60, "RESTART");
}

function draw() {
  // Update the window.gameState to match the local gameState variable
  // This ensures both stay in sync
  gameState = window.gameState;

  // Default sky blue background until assets are ready
  background(135, 206, 235);

  switch (gameState) {
    case "START":
      image(assets.backgrounds.forest, 0, 0, 720, 513);
      drawStartScreen();
      break;
    case "SELECT":
      image(assets.backgrounds.forest, 0, 0, 720, 513);
      drawCharacterSelect();
      break;
    case "PLAY":
      image(assets.backgrounds.forest, 0, 0, 720, 513);
      drawGame();
      break;
    case "ROOM":
      RoomManager.drawRoomCode(width, height);
      break;
  }
}

function titleComponent(assetName, w, h) {
  // Caption title component
  imageMode(CENTER);
  image(assetName, width / 2, 48, w, h);
  imageMode(CORNER);
}

function drawStartScreen() {
  titleComponent(assets.signs.title, 240, 48);

  // Title
  textFont(assets.fonts.headingText);
  textSize(64);
  fill(255);
  text("Love Birds", width / 2, height / 3);

  // Subtitle
  textFont(assets.fonts.bodyText);
  textSize(16);
  text("A Game About Connection", width / 2, height / 2);

  // Draw start button
  startButton.draw();
}

function drawCharacterSelect() {
  imageMode(CORNER);
  image(assets.backgrounds.forest, 0, 0, 720, 513);

  // Draw bird sprite if available
  imageMode(CENTER);
  titleComponent(assets.signs.title, 240, 48);

  // Draw character options
  drawCharacterOption("Wingman", 200, 320, assets.birds.wingman);
  drawCharacterOption("Male Bird", 480, 320, assets.birds.male);
}

function drawCharacterOption(role, x, y, birdImage) {
  let isHovered =
    mouseX > x - 120 &&
    mouseX < x + 120 &&
    mouseY > y - 120 &&
    mouseY < y + 120;

  if (isHovered) {
    tint(255, 238); // 80% opacity (204/255)
  } else {
    tint(255, 255); // Full opacity
  }

  // Draw bird sprite if available
  imageMode(CENTER);
  image(birdImage, x, y - 30, 240, 240);
  tint(255, 255); // Full opacity
}

function centerCard(birdImage) {
  // Draw bird sprite if available
  imageMode(CENTER);
  image(birdImage, width / 2, height / 2 - 24, 264, 264);
  tint(255, 255); // Full opacity
}

function drawGame() {
  // Use background image if available
  imageMode(CORNER);
  image(assets.backgrounds.forest, 0, 0, 720, 513);

  if (selectedRole === "MALE_BIRD") {
    drawMaleBirdScreen();
  } else {
    drawWingmanScreen();
  }
}

// Modify your drawMaleBirdScreen function to include the direction game
function drawMaleBirdScreen() {
  // Use background image if available
  imageMode(CORNER);
  image(assets.backgrounds.forest, 0, 0, 720, 513);

  if (final === true) {
    if (!directionGameActive) {
      // First time reaching final state, initialize the direction game
      directionGameActive = true;
      gameStartTime = millis();
      playerInputs = [];
      drawPositions = [];
      playerWon = false;
    }

    // Draw direction game
    drawDirectionGame();
    return;
  }

  // If not in final state, draw the regular screens
  titleComponent(assets.signs.how, 320, 48);

  if (counter === 0) {
    centerCard(assets.cards.male);
    continueButton.draw();
  } else if (counter === 1) {
    centerCard(assets.cards.altmale);
    continueButton.draw();
  } else if (counter === 2) {
    centerCard(assets.cards.dance);
    continueButton.draw();
  }
}

// Update the drawDirectionGame function to show restart button on win screen
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

// Process direction inputs function
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

// Update the drawWingmanScreen function to add restart button
function drawWingmanScreen() {
  imageMode(CORNER);
  image(assets.backgrounds.forest, 0, 0, 720, 513);

  if (final) {
    // If final is true, show the wingman background
    imageMode(CORNER);
    image(assets.backgrounds.wingman, 0, 0, 720, 513);

    // Add restart button at the bottom
    resetButton.draw();

    return; // Exit early to avoid drawing other elements
  }

  // Only draw the title if we're not in the final state
  titleComponent(assets.signs.how, 320, 48);

  if (counter === 0) {
    centerCard(assets.cards.female);
    continueButton.draw();
  } else if (counter === 1) {
    centerCard(assets.cards.wingman);
    continueButton.draw();
  } else if (counter === 2) {
    centerCard(assets.cards.wingman); // Or use a different card if needed
    continueButton.draw();
  }
}

function keyPressed() {
  // Handle room code input through the RoomManager
  if (gameState === "ROOM") {
    if (keyCode === BACKSPACE) {
      RoomManager.updateInputCode("BACKSPACE");
    } else if (keyCode === ENTER) {
      RoomManager.updateInputCode("ENTER");
    } else if (key.length === 1) {
      RoomManager.updateInputCode(key);
    }
  }

  // Direction game logic
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

function mousePressed() {
  // Strong debounce protection
  const currentTime = millis();
  if (currentTime - lastClickTime < CLICK_DELAY) {
    console.log("Debounced click - too soon after last click");
    return;
  }
  lastClickTime = currentTime;

  // Handle room code screen interactions
  if (gameState === "ROOM") {
    if (
      mouseX > width / 2 - 50 &&
      mouseX < width / 2 + 50 &&
      mouseY > 130 &&
      mouseY < 170
    ) {
      RoomManager.copyRoomCode();
    }
    return;
  }

  // PLAY state - handle direction game clicks
  if (
    gameState === "PLAY" &&
    selectedRole === "MALE_BIRD" &&
    final &&
    directionGameActive
  ) {
    // Only process clicks if the player has won and is clicking the reset button
    if (playerWon && resetButton && resetButton.isClicked()) {
      gameState = "SELECT";
      selectedRole = "";
      counter = 0;
      final = false;
      directionGameActive = false;
      playerWon = false;
      playerInputs = [];
      drawPositions = [];
      console.log("FULL GAME RESET - Back to character selection");
    }
    // Ignore all other clicks during the direction game
    return;
  }

  // Start button - only in START state
  if (gameState === "START" && startButton && startButton.isClicked()) {
    gameState = "SELECT";
    console.log("Changed to SELECT state");
    return;
  }

  // Character Selection - only in SELECT state
  if (gameState === "SELECT") {
    // Wingman selection
    if (
      mouseX > 200 - 120 &&
      mouseX < 200 + 120 &&
      mouseY > 320 - 120 &&
      mouseY < 320 + 120
    ) {
      selectedRole = "WINGMAN";
      gameState = "PLAY";
      counter = 0;
      final = false;
      console.log("Selected WINGMAN, reset counter to 0, final to false");
      return;
    }

    // Male bird selection
    if (
      mouseX > 480 - 120 &&
      mouseX < 480 + 120 &&
      mouseY > 320 - 120 &&
      mouseY < 320 + 120
    ) {
      selectedRole = "MALE_BIRD";
      gameState = "PLAY";
      counter = 0;
      final = false;
      console.log("Selected MALE_BIRD, reset counter to 0, final to false");
      return;
    }
    return; // Exit if we're in SELECT but didn't click on a character
  }

  // PLAY state button handling - split by specific conditions
  if (gameState === "PLAY") {
    // Reset button - only check in final states for Wingman
    if (
      selectedRole === "WINGMAN" &&
      final &&
      resetButton &&
      resetButton.isClicked()
    ) {
      gameState = "SELECT";
      selectedRole = "";
      counter = 0;
      final = false;
      directionGameActive = false;
      playerWon = false;
      playerInputs = [];
      drawPositions = [];
      console.log("FULL GAME RESET - Back to character selection");
      return;
    }

    // Continue button - only check when NOT in final state
    if (!final && continueButton && continueButton.isClicked()) {
      // Store old values for logging
      const oldCounter = counter;
      const oldFinal = final;

      // Update state based on current counter value
      if (counter === 0) {
        counter = 1;
      } else if (counter === 1) {
        counter = 2;
      } else if (counter === 2) {
        final = true;
      }

      // Log the change that occurred
      console.log(
        `Button click: counter ${oldCounter}->${counter}, final ${oldFinal}->${final}`
      );
      return;
    }
  }
}

// Button class
class Button {
  constructor(x, y, w, h, text) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.text = text;
  }

  draw() {
    let isHovered =
      mouseX > this.x - this.w / 2 &&
      mouseX < this.x + this.w / 2 &&
      mouseY > this.y - this.h / 2 &&
      mouseY < this.y + this.h / 2;

    // Button background
    rectMode(CENTER);
    fill(isHovered ? "#161616" : "black");
    rect(this.x, this.y, this.w, this.h, 10);

    // Button text
    textFont(assets.fonts.bodyText);
    textSize(20);
    fill(255);
    text(this.text, this.x, this.y);
  }

  isClicked() {
    return (
      mouseX > this.x - this.w / 2 &&
      mouseX < this.x + this.w / 2 &&
      mouseY > this.y - this.h / 2 &&
      mouseY < this.y + this.h / 2
    );
  }
}
