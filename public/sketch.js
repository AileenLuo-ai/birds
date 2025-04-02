// UI-specific variables
let startButton;
let instructionButton;
let continueButton;
let lastClickTime = 0;
const CLICK_DELAY = 100; // Increase delay to ensure clicks are well-separated
let playButton;
let resetButton;
let nextButton;
let lvlButton;
let wingButton;

function preload() {
  preloadAssets(); // Load assets from assets.js
}

function setup() {
  createCanvas(720, 513);
  textAlign(CENTER, CENTER);

  // Ensure the button is created AFTER canvas is set up
  startButton = new Button(width / 2 - 108, height - 140, 172, 60, "START");
  instructionButton = new Button(
    width / 2 + 108,
    height - 140,
    200,
    60,
    "INSTRUCTIONS"
  );
  continueButton = new Button(
    width / 2 + 196,
    height - 72,
    148,
    60,
    "CONTINUE"
  );
  resetButton = new Button(width / 2, height / 2, 200, 60, "RESTART");
  wingButton = new Button(width / 2 + 200, height - 72, 200, 60, "PLAY AGAIN");
  nextButton = new Button(width / 2 + 128, height - 72, 200, 60, "NEXT");
  playButton = new Button(width / 2 + 128, height - 72, 200, 60, "PLAY");
  lvlButton = new Button(width / 2, height - 72, 200, 60, "NEXT LEVEL");
  // Initialize direction game
  initDirectionGame();
}

function draw() {
  // Try to play background music if it's loaded
  // assets.sounds.backgroundMusic.loop();
  // Default sky blue background until assets are ready
  background(135, 206, 235);
  image(assets.backgrounds.forest, 0, 0, 720, 513);

  switch (gameState) {
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

function titleComponent(assetName, w, h) {
  // caption title component
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

  // Draw start button
  startButton.draw();
  instructionButton.draw();
}

function drawCharacterSelect() {
  imageMode(CORNER);
  image(assets.backgrounds.forest, 0, 0, 720, 513);

  // Draw bird sprite if available
  imageMode(CENTER);
  titleComponent(assets.signs.title, 240, 48);

  // Draw character options with role status
  drawCharacterOption("Wingman", 200, 320, assets.birds.wingman);
  drawCharacterOption("Male Bird", 480, 320, assets.birds.male);
}

function instructionSizing(imageInstruction) {
  imageMode(CENTER);
  image(imageInstruction, width / 2, height / 2, 560, 467);
}

function instructionScreen() {
  // Use background image if available
  imageMode(CORNER);
  image(assets.backgrounds.forest, 0, 0, 720, 513);

  if (instructionCounter === 0) {
    instructionSizing(assets.instructions.instruction1);
    nextButton.draw();
  } else if (instructionCounter === 1) {
    instructionSizing(assets.instructions.instruction2);
    nextButton.draw();
  } else if (instructionCounter === 2) {
    instructionSizing(assets.instructions.instruction3);
    nextButton.draw();
  } else if (instructionCounter === 3) {
    instructionSizing(assets.instructions.instruction4);
    nextButton.draw();
  } else if (instructionCounter === 4) {
    instructionSizing(assets.instructions.instruction5);
    playButton.draw();
  }
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

function drawMaleBirdScreen() {
  if (instructionCounter === 0) {
    // Use background image if available
    imageMode(CORNER);
    image(assets.backgrounds.forest, 0, 0, 720, 513);
    titleComponent(assets.signs.level, 240, 48);
    instructionSizing(assets.instructions.level2);
    nextButton.draw();
  } else if (final === true) {
    // Call our new dedicated function for level 1 gameplay
    drawPlayScreen();
  }
}

function tryAgain() {
  // Add text for restarting
  fill("white");
  textAlign(CENTER, CENTER);
  textSize(20);
  text("Press ENTER to restart", width - 164, 84);
  pop();
}

function drawWingmanScreen() {
  imageMode(CORNER);
  image(assets.backgrounds.forest, 0, 0, 720, 513);
  // Only draw the title if we're not in the final state
  titleComponent(assets.signs.how, 320, 48);

  if (counter === 0) {
    image(assets.backgrounds.wing1, 0, 0, width, height);
    tryAgain();
    continueButton.draw();
  } else if (counter === 1) {
    image(assets.backgrounds.wing2, 0, 0, width, height);
    tryAgain();
    continueButton.draw();
  } else if (counter === 2) {
    image(assets.backgrounds.wing3, 0, 0, width, height);
    tryAgain();
    wingButton.draw();
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

// Add this new function
function handleReset() {
  gameState = "START";
  selectedRole = "";
  counter = 0;
  final = false;
  directionGameActive = false;
  playerWon = false;
  instructionCounter = 0;
  playerInputs = [];
  drawPositions = [];
  rightInput = 0;
  wrongInput = 0;
  currentBirdDirection = "right";
  console.log("Game reset to character selection");
  return;
}

// Modify the mousePressed function to use the new reset handler
function mousePressed() {
  // Strong debounce protection
  const currentTime = millis();
  if (currentTime - lastClickTime < CLICK_DELAY) {
    console.log("Debounced click - too soon after last click");
    return;
  }
  lastClickTime = currentTime;

  if (nextButton && nextButton.isClicked() && instructionCounter < 1) {
    instructionCounter++;
    console.log("instructionCounter", instructionCounter);
    return;
  }

  // Handle level transitions
  if (directionGameActive && playerWon) {
    if (lvlButton.isClicked() && gameState === "PLAY") {
      gameState = "LEVEL 2";
      instructionCounter = 0;
      // Reset game time for new level
      resetGameTimer();
      playerWon = false;
    } else if (lvlButton.isClicked() && gameState === "LEVEL 2") {
      gameState = "LEVEL 3";
      instructionCounter = 0;
      // Reset game time for new level
      resetGameTimer();
      playerWon = false;
    }
  }

  // Handle wingman level transitions
  if (selectedRole === "WINGMAN" && playerWon) {
    if (lvlButton.isClicked() && gameState === "PLAY") {
      gameState = "LEVEL 2";
      instructionCounter = 0;
      playerWon = false;
    } else if (lvlButton.isClicked() && gameState === "LEVEL 2") {
      gameState = "LEVEL 3";
      instructionCounter = 0;
      playerWon = false;
    }
  }

  // Start button - only in START state
  if (gameState === "START" && instructionButton.isClicked()) {
    gameState = "INSTRUCTION";
    console.log("Changed to INSTRUCTION state");
  }

  // Start button - only in START state
  if (
    gameState === "INSTRUCTION" &&
    playButton.isClicked() &&
    instructionCounter === 5
  ) {
    gameState = "SELECT";
  }

  // DISABLE CLICKS: If we're in the male bird direction game and it's active
  // (only allow reset button clicks if the game is won)
  if (
    gameState === "PLAY" &&
    selectedRole === "MALE_BIRD" &&
    final &&
    directionGameActive
  ) {
    return;
  }

  // Start button - only in START state
  if (gameState === "START" && startButton && startButton.isClicked()) {
    gameState = "SELECT";
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
      return;
    }
    return; // Exit if we're in SELECT but didn't click on a character
  }

  // PLAY state button handling - split by specific conditions
  if (gameState === "PLAY") {
    if (selectedRole === "MALE_BIRD") {
      if (continueButton && continueButton.isClicked()) {
        counter++;
        console.log("counter", counter);
      }

      if (counter > 0) {
        final = true;
      }
    }

    if (
      selectedRole === "WINGMAN" &&
      continueButton &&
      continueButton.isClicked()
    ) {
      counter++;
      console.log("counter", counter);
      if (counter > 2) {
        final = true;
        handleReset();
      }
      return;
    }
  }

  // Global reset check - should be first
  if (
    (selectedRole === "MALE_BIRD" && resetButton && resetButton.isClicked()) ||
    (selectedRole === "WINGMAN" && wingButton && wingButton.isClicked()) ||
    (selectedRole === "WINGMAN" && counter >= 3)
  ) {
    console.log("Reset button clicked");
    handleReset();
  }
}

// Add keyPressed function to handle keyboard input
function keyPressed() {
  // Handle Enter key press for Wingman restart
  if (
    (selectedRole === "WINGMAN" && keyCode === ENTER && gameState === "PLAY") ||
    (selectedRole === "WINGMAN" &&
      keyCode === ENTER &&
      gameState === "INSTRUCTION")
  ) {
    handleReset();
    return false;
  }

  // Only process key events for the direction game
  if (
    (selectedRole === "MALE_BIRD" &&
      directionGameActive &&
      gameState === "PLAY") ||
    gameState === "LEVEL 2" ||
    gameState === "LEVEL 3"
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
