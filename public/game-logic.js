// Add the patterns object at the top of the file
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
  currentLevel: 1,
  gameState: "PLAY",
  final: false,
  counter: 0,
  partyId: null, // Add party ID to shared state
  players: [], // Track players in the party
  isPartyFull: false, // Track if party is full
};

function resetGameTimer() {
  party.gameStartTime = millis();
  party.timeRemaining = gameTimeLimit;
  party.isGameActive = true;
  party.playerWon = false;
  console.log("Timer reset, new start time:", party.gameStartTime);
}

// Initialize socket connection
function initMultiplayer() {
  socket = io();

  socket.on("connect", () => {
    myId = socket.id;
    console.log("Connected to server with ID:", myId);

    // Request to join or create a party
    socket.emit("findParty");
  });

  socket.on("partyFound", (partyData) => {
    console.log("Received party data:", partyData);
    party.partyId = partyData.partyId;
    party.players = partyData.players;
    party.isPartyFull = partyData.isFull;
    console.log("Joined party:", party.partyId, "Players:", party.players);

    // If we're the first player, wait for another player
    if (party.players.length === 1) {
      console.log("Waiting for another player to join...");
      gameState = "SELECT"; // Allow character selection screen
    }
  });

  socket.on("playerJoined", (data) => {
    console.log("Player joined event received:", data);
    connectedPlayers.add(data.playerId);
    party.players.push(data.playerId);
    party.isPartyFull = party.players.length >= 2;
    console.log("Player joined party:", data.playerId);

    // If we're the second player, we can now select roles
    if (party.players.length === 2) {
      console.log("Party is full! Players can now select roles.");
      gameState = "SELECT"; // Ensure we're on character selection screen
    }
  });

  socket.on("playerLeft", (data) => {
    console.log("Player left event received:", data);
    connectedPlayers.delete(data.playerId);
    party.players = party.players.filter((id) => id !== data.playerId);
    party.isPartyFull = false;
    console.log("Player left party:", data.playerId);

    // If we're in the game, reset to character selection
    if (gameState !== "START" && gameState !== "SELECT") {
      handleReset();
    }
  });

  socket.on("roleSelected", (data) => {
    console.log("Role selected event received:", data);
    if (data.playerId !== myId) {
      // If another player selected a role, update the UI
      if (gameState === "SELECT") {
        // Update UI to show which role is taken
        if (data.role === "WINGMAN") {
          // Disable wingman selection
          console.log("Wingman role taken");
        } else if (data.role === "MALE_BIRD") {
          // Disable male bird selection
          console.log("Male bird role taken");
        }
      }
    }
  });

  socket.on("roleTaken", (data) => {
    console.log("Role taken event received:", data);
    alert(
      `The ${data.role} role is already taken! Please select the other role.`
    );
  });

  socket.on("gameStateUpdated", (gameState) => {
    console.log("Received game state update:", gameState);
  });

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
  directionGameActive = false;
  playerInputs = [];
  drawPositions = [];
  playerWon = false;
  currentBirdDirection = "right";
  resetGameTimer();
  isGameOver = false;

  // Generate random word and sync with other player
  const patternTypes = Object.keys(patterns);
  currentPatternType =
    patternTypes[Math.floor(Math.random() * patternTypes.length)];

  if (myRole === "MALE_BIRD") {
    // Generate and broadcast the word
    currentWord = currentPatternType;
    socket.emit("updateGameState", {
      currentWord,
      directionGameActive: true,
    });
  }
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

// Update the mousePressed function for level transitions
function mousePressed() {
  // ... existing code ...

  if (playerWon) {
    if (lvlButton.isClicked() && gameState === "PLAY") {
      party.gameState = "LEVEL 2";
      party.currentLevel = 2;
      party.final = true;
      party.counter = 2;
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
      party.gameState = "LEVEL 3";
      party.currentLevel = 3;
      party.final = true;
      party.counter = 2;
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
  party.gameState = "START";
  party.currentLevel = 1;
  party.final = false;
  party.counter = 0;
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

  // Notify other player of game reset
  socket.emit("gameReset");
}

// Modify the character selection to check party status
function selectRole(role) {
  if (!party.isPartyFull) {
    alert("Waiting for another player to join the party...");
    return;
  }

  if (party.players.length === 2) {
    selectedRole = role;
    socket.emit("selectRole", { role, partyId: party.partyId });
    gameState = "PLAY";
    counter = 0;
    final = false;
  }
}
