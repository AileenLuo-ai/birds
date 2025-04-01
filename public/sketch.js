// Game state variables
let gameState = "START";
let selectedRole = "";
let startButton;
let instructionButton;
let continueButton;
let counter = 0;
let final = false;
let lastClickTime = 0;
const CLICK_DELAY = 100; // Increase delay to ensure clicks are well-separated
let playButton;
let resetButton;
let instructionCounter = 0;
let nextButton;
let lvlButton;

function preload() {
  preloadAssets(); // Load assets from assets.js
}

function setup() {
  createCanvas(720, 513);
  textAlign(CENTER, CENTER);

  // Initialize multiplayer
  initMultiplayer();

  // Ensure the button is created AFTER canvas is set up
  startButton = new Button(width / 2, height - 140, 200, 60, "START");
  instructionButton = new Button(
    width / 2,
    height - 64,
    200,
    60,
    "INSTRUCTIONS"
  );
  continueButton = new Button(
    width / 2 + 128,
    height - 72,
    200,
    60,
    "CONTINUE"
  );
  resetButton = new Button(width / 2, height / 2, 200, 60, "RESTART");
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

  // Subtitle
  textFont(assets.fonts.bodyText);
  textSize(16);
  text("A Game About Connection", width / 2, height / 2);

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

  // Add role label
  textFont(assets.fonts.bodyText);
  textSize(24);
  fill(255);
  text(role, x, y + 120);
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
  // Use background image if available
  imageMode(CORNER);
  image(assets.backgrounds.forest, 0, 0, 720, 513);

  titleComponent(assets.signs.level, 240, 48);
  instructionSizing(assets.instructions.level2);
  continueButton.draw();

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
    drawDirectionGame(assets.backgrounds.play1, assets.backgrounds.win, 1);
    return;
  }
}

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
  gameState = "SELECT";
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

  switch (gameState) {
    case "START":
      if (startButton.isClicked()) {
        gameState = "SELECT";
      } else if (instructionButton.isClicked()) {
        gameState = "INSTRUCTION";
      }
      break;

    case "SELECT":
      // Handle role selection
      if (mouseX > 80 && mouseX < 320 && mouseY > 200 && mouseY < 440) {
        selectedRole = "WINGMAN";
        myRole = "WINGMAN";
        socket.emit("selectRole", "WINGMAN");
        gameState = "PLAY";
        counter = 0;
        final = false;
      } else if (mouseX > 360 && mouseX < 600 && mouseY > 200 && mouseY < 440) {
        selectedRole = "MALE_BIRD";
        myRole = "MALE_BIRD";
        socket.emit("selectRole", "MALE_BIRD");
        gameState = "PLAY";
        counter = 0;
        final = false;
      }
      break;

    case "INSTRUCTION":
      if (nextButton.isClicked()) {
        instructionCounter++;
      } else if (playButton.isClicked()) {
        gameState = "SELECT";
      }
      break;

    case "PLAY":
      if (continueButton.isClicked()) {
        counter++;
        if (counter === 3) {
          final = true;
        }
      }
      break;

    case "LEVEL 2":
      if (lvlButton.isClicked()) {
        gameState = "LEVEL 3";
      }
      break;

    case "LEVEL 3":
      if (resetButton.isClicked()) {
        handleReset();
      }
      break;
  }
}

// Add keyPressed function to handle keyboard input
function keyPressed() {
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
