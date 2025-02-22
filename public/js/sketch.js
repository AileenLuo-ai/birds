// sketch.js
let gameState = 'START';
let selectedRole = '';
let startButton;

function preload() {
  preloadAssets(); // Call preload from assets.js
}

function setup() {
  createCanvas(windowWidth/2, windowHeight);
  textAlign(CENTER, CENTER);
  
  // Initialize start button
  startButton = new Button(width/2, height/2, 200, 60, 'START');
}

function draw() {
  // Draw background (sky blue until we have background images)
  background(135, 206, 235);
  
  switch(gameState) {
    case 'START':
      drawStartScreen();
      break;
    case 'SELECT':
      drawCharacterSelect();
      break;
    case 'PLAY':
      drawGame();
      break;
  }
}

function drawStartScreen() {
  // Title
  textFont(assets.fonts.pixelify);
  textSize(64);
  fill(255);
  text('Love Birds', width/2, height/3);
  
  // Subtitle
  textFont(assets.fonts.press2start);
  textSize(16);
  text('A Game About Connection', width/2, height/3 + 70);
  
  // Draw start button
  startButton.draw();
}

function drawCharacterSelect() {
  // Title
  textFont(assets.fonts.pixelify);
  textSize(48);
  fill(255);
  text('Choose Your Role', width/2, height/4);
  
  // Character options
  drawCharacterOption('Wingman', width/4, height/2);
  drawCharacterOption('Male Bird', 3*width/4, height/2);
}

function drawCharacterOption(role, x, y) {
  let isHovered = mouseX > x - 100 && mouseX < x + 100 &&
                  mouseY > y - 100 && mouseY < y + 100;
  
  // Option box
  fill(isHovered ? 220 : 200);
  rectMode(CENTER);
  rect(x, y, 200, 200);
  
  // Role text
  fill(0);
  textFont(assets.fonts.press2start);
  textSize(16);
  text(role, x, y + 120);
}

function drawGame() {
  if (selectedRole === 'MALE_BIRD') {
    drawMaleBirdScreen();
  } else {
    drawWingmanScreen();
  }
}

function drawMaleBirdScreen() {
  textFont(assets.fonts.pixelify);
  textSize(32);
  text('Male Bird View', width/2, height/4);
}

function drawWingmanScreen() {
  textFont(assets.fonts.pixelify);
  textSize(32);
  text('Wingman View', width/2, height/4);
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
    let isHovered = mouseX > this.x - this.w/2 && mouseX < this.x + this.w/2 && 
                    mouseY > this.y - this.h/2 && mouseY < this.y + this.h/2;
    
    // Button background
    rectMode(CENTER);
    fill(isHovered ? '#6495ED' : '#4169E1');
    rect(this.x, this.y, this.w, this.h, 10);
    
    // Button text
    textFont(assets.fonts.press2start);
    textSize(20);
    fill(255);
    text(this.text, this.x, this.y);
  }
  
  isClicked() {
    return mouseX > this.x - this.w/2 && mouseX < this.x + this.w/2 && 
           mouseY > this.y - this.h/2 && mouseY < this.y + this.h/2;
  }
}

function mousePressed() {
  // Start button
  if (gameState === 'START' && startButton.isClicked()) {
    gameState = 'SELECT';
  }
  
  // Character selection
  if (gameState === 'SELECT') {
    // Wingman selection
    if (mouseX > width/4 - 100 && mouseX < width/4 + 100 &&
        mouseY > height/2 - 100 && mouseY < height/2 + 100) {
      selectedRole = 'WINGMAN';
      gameState = 'PLAY';
    }
    // Male bird selection
    if (mouseX > 3*width/4 - 100 && mouseX < 3*width/4 + 100 &&
        mouseY > height/2 - 100 && mouseY < height/2 + 100) {
      selectedRole = 'MALE_BIRD';
      gameState = 'PLAY';
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth/2, windowHeight);
  startButton.x = width/2;
  startButton.y = height/2;
}