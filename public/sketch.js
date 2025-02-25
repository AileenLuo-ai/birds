let gameState = "START";
let selectedRole = "";
let startButton;

function preload() {
  preloadAssets(); // Load assets from assets.js
}

function setup() {
  createCanvas(windowWidth / 2, windowHeight);
  textAlign(CENTER, CENTER);

  // Ensure the button is created AFTER canvas is set up
  startButton = new Button(width / 2, height / 2, 200, 60, "START");
  console.log("Start button initialized:", startButton);
}

function draw() {
  // Try to play background music if it's loaded
  if (assets.sounds.backgroundMusic && 
      typeof assets.sounds.backgroundMusic.isPlaying === 'function' && 
      !assets.sounds.backgroundMusic.isPlaying()) {
    try {
      assets.sounds.backgroundMusic.loop();
    } catch (e) {
      console.error("Error playing background music:", e);
    }
  }

  // Default sky blue background until assets are ready
  background(135, 206, 235);

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
  }
}

function drawStartScreen() {
  // Title
  if (assets.fonts.headingText) {
    textFont(assets.fonts.headingText);
  } else {
    // Fallback to default font if custom font isn't loaded
    textFont('Arial');
  }
  textSize(64);
  fill(255);
  text("Love Birds", width / 2, height / 3);

  // Subtitle
  if (assets.fonts.bodyText) {
    textFont(assets.fonts.bodyText);
  } else {
    textFont('Arial');
  }
  textSize(16);
  text("A Game About Connection", width / 2, height / 3 + 70);

  // Draw start button
  startButton.draw();
}

function drawCharacterSelect() {
  // Title
  if (assets.fonts.headingText) {
    textFont(assets.fonts.headingText);
  } else {
    textFont('Arial');
  }
  textSize(48);
  fill(255);
  text("Choose Your Role", width / 2, height / 4);

  // Draw character options
  drawCharacterOption("Wingman", width / 4, height / 2, assets.birds.female);
  drawCharacterOption("Male Bird", (3 * width) / 4, height / 2, assets.birds.male);
}

function drawCharacterOption(role, x, y, birdImage) {
  let isHovered =
    mouseX > x - 100 &&
    mouseX < x + 100 &&
    mouseY > y - 100 &&
    mouseY < y + 100;

  // Option box
  fill(isHovered ? 220 : 200);
  rectMode(CENTER);
  rect(x, y, 200, 200);

  // Draw bird sprite if available
  if (birdImage) {
    imageMode(CENTER);
    image(birdImage, x, y - 30, 80, 80);
  }

  // Role text
  fill(0);
  if (assets.fonts.bodyText) {
    textFont(assets.fonts.bodyText);
  } else {
    textFont('Arial');
  }
  textSize(16);
  text(role, x, y + 120);
}

function drawGame() {
  // Use background image if available
  if (assets.backgrounds.forest) {
    image(assets.backgrounds.forest, 0, 0, width, height);
  } else {
    background(135, 206, 235); // Fallback color
  }

  if (selectedRole === "MALE_BIRD") {
    drawMaleBirdScreen();
  } else {
    drawWingmanScreen();
  }
}

function drawMaleBirdScreen() {
  if (assets.fonts.headingText) {
    textFont(assets.fonts.headingText);
  } else {
    textFont('Arial');
  }
  textSize(32);
  text("Male Bird View", width / 2, height / 4);
}

function drawWingmanScreen() {
  if (assets.fonts.headingText) {
    textFont(assets.fonts.headingText);
  } else {
    textFont('Arial');
  }
  textSize(32);
  text("Wingman View", width / 2, height / 4);
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
    fill(isHovered ? "#6495ED" : "#4169E1");
    rect(this.x, this.y, this.w, this.h, 10);

    // Button text
    if (assets.fonts.bodyText) {
      textFont(assets.fonts.bodyText);
    } else {
      textFont('Arial');
    }
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

function mousePressed() {
  // Check if startButton is defined before calling isClicked()
  if (gameState === "START" && startButton && startButton.isClicked()) {
    gameState = "SELECT";
  }

  // Character selection
  if (gameState === "SELECT") {
    if (
      mouseX > width / 4 - 100 &&
      mouseX < width / 4 + 100 &&
      mouseY > height / 2 - 100 &&
      mouseY < height / 2 + 100
    ) {
      selectedRole = "WINGMAN";
      gameState = "PLAY";
    }
    if (
      mouseX > (3 * width) / 4 - 100 &&
      mouseX < (3 * width) / 4 + 100 &&
      mouseY > height / 2 - 100 &&
      mouseY < height / 2 + 100
    ) {
      selectedRole = "MALE_BIRD";
      gameState = "PLAY";
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth / 2, windowHeight);
}