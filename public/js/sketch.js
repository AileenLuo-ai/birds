// Game states and role tracking
let gameState = "START"; // START, SELECT, INSTRUCTIONS, PLAY
let selectedRole = ""; // 'MALE_BIRD' or 'WINGMAN'

// Assets
let startButton;
let playButton;
let fonts = {};

function preload() {
  // Load fonts here
  // fonts.pixel = loadFont('assets/fonts/PixelifySans-Regular.ttf');
  // fonts.press = loadFont('assets/fonts/PressStart2P-Regular.ttf');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);

  // Initialize buttons
  startButton = {
    x: width / 2,
    y: height / 2,
    w: 200,
    h: 60,
    text: "START",
    isHovered: false,
  };

  playButton = {
    x: width / 2,
    y: height * 0.8,
    w: 200,
    h: 60,
    text: "PLAY",
    isHovered: false,
  };
}

function draw() {
  background(135, 206, 235); // Sky blue

  switch (gameState) {
    case "START":
      drawStartScreen();
      break;
    case "SELECT":
      drawCharacterSelect();
      break;
    case "INSTRUCTIONS":
      drawInstructions();
      break;
    case "PLAY":
      drawGame();
      break;
  }
}

function drawStartScreen() {
  // Draw title
  fill(255);
  textSize(64);
  text("Love Birds", width / 2, height / 3);

  // Draw button
  drawButton(startButton);
}

function drawCharacterSelect() {
  fill(255);
  textSize(48);
  text("Choose Your Role", width / 2, height / 4);

  // Draw character options
  drawCharacterOption("Wingman", width / 4, height / 2);
  drawCharacterOption("Male Bird", (3 * width) / 4, height / 2);
}

function drawInstructions() {
  fill(255);
  textSize(48);
  text("Instructions", width / 2, height / 4);

  // Different instructions based on selected role
  if (selectedRole === "MALE_BIRD") {
    drawMaleBirdInstructions();
  } else if (selectedRole === "WINGMAN") {
    drawWingmanInstructions();
  }

  // Draw play button
  drawButton(playButton);
}

function drawMaleBirdInstructions() {
  fill(255);
  textSize(24);
  textAlign(LEFT, CENTER);

  let instructions = [
    "As the Male Bird, your goal is to perform the correct dance moves",
    "Listen carefully to your Wingman's instructions",
    "Use arrow keys to perform dance moves",
    "Complete the sequence before time runs out!",
    "Get at least 80% correct to win the female bird's heart",
  ];

  let startY = height * 0.4;
  let spacing = 40;

  for (let i = 0; i < instructions.length; i++) {
    text(instructions[i], width * 0.2, startY + i * spacing);
  }

  textAlign(CENTER, CENTER);
}

function drawWingmanInstructions() {
  fill(255);
  textSize(24);
  textAlign(LEFT, CENTER);

  let instructions = [
    "As the Wingman, you need to guide the Male Bird",
    "Watch for the female bird's signals",
    "Look up the meaning in your rulebook",
    "Clearly communicate the required dance moves",
    "Help your friend find love!",
  ];

  let startY = height * 0.4;
  let spacing = 40;

  for (let i = 0; i < instructions.length; i++) {
    text(instructions[i], width * 0.2, startY + i * spacing);
  }

  textAlign(CENTER, CENTER);
}

function drawGame() {
  fill(255);
  textSize(32);
  if (selectedRole === "MALE_BIRD") {
    text("Male Bird Game Screen", width / 2, height / 2);
  } else {
    text("Wingman Game Screen", width / 2, height / 2);
  }
}

function drawButton(btn) {
  btn.isHovered =
    mouseX > btn.x - btn.w / 2 &&
    mouseX < btn.x + btn.w / 2 &&
    mouseY > btn.y - btn.h / 2 &&
    mouseY < btn.y + btn.h / 2;

  fill(btn.isHovered ? "#6495ED" : "#4169E1");
  rectMode(CENTER);
  rect(btn.x, btn.y, btn.w, btn.h, 10);

  fill(255);
  textSize(20);
  text(btn.text, btn.x, btn.y);
}

function drawCharacterOption(role, x, y) {
  // Check if mouse is hovering over this option
  let isHovered =
    mouseX > x - 100 &&
    mouseX < x + 100 &&
    mouseY > y - 100 &&
    mouseY < y + 100;

  fill(isHovered ? 220 : 200);
  rectMode(CENTER);
  rect(x, y, 200, 200);

  fill(0);
  textSize(20);
  text(role, x, y + 150);
}

function mousePressed() {
  // Start button
  if (
    gameState === "START" &&
    mouseX > startButton.x - startButton.w / 2 &&
    mouseX < startButton.x + startButton.w / 2 &&
    mouseY > startButton.y - startButton.h / 2 &&
    mouseY < startButton.y + startButton.h / 2
  ) {
    gameState = "SELECT";
  }

  // Character selection
  if (gameState === "SELECT") {
    // Wingman selection
    if (
      mouseX > width / 4 - 100 &&
      mouseX < width / 4 + 100 &&
      mouseY > height / 2 - 100 &&
      mouseY < height / 2 + 100
    ) {
      selectedRole = "WINGMAN";
      gameState = "INSTRUCTIONS";
    }
    // Male bird selection
    if (
      mouseX > (3 * width) / 4 - 100 &&
      mouseX < (3 * width) / 4 + 100 &&
      mouseY > height / 2 - 100 &&
      mouseY < height / 2 + 100
    ) {
      selectedRole = "MALE_BIRD";
      gameState = "INSTRUCTIONS";
    }
  }

  // Play button in instructions screen
  if (
    gameState === "INSTRUCTIONS" &&
    mouseX > playButton.x - playButton.w / 2 &&
    mouseX < playButton.x + playButton.w / 2 &&
    mouseY > playButton.y - playButton.h / 2 &&
    mouseY < playButton.y + playButton.h / 2
  ) {
    gameState = "PLAY";
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  startButton.x = width / 2;
  startButton.y = height / 2;
  playButton.x = width / 2;
  playButton.y = height * 0.8;
}
