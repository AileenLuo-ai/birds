// room-manager.js - Contains all room-related functionality
// This approach keeps these variables in a separate scope

// Create a namespace for room management functionality
const RoomManager = {
  socket: null,
  roomCode: "",
  inputRoomCode: "",
  timer: 0,
  copied: false,
  playerCount: 0,
  roomJoined: false,
  roomMessage: "",
  timerActive: false,

  // Initialize the socket connection
  init: function () {
    if (!this.socket) {
      this.socket = io.connect("http://localhost:3000");

      // Set up event listeners
      this.socket.on("timer-updated", (updatedTimer) => {
        this.timer = updatedTimer;
      });

      // Listen for player count updates
      this.socket.on("player-count", (count) => {
        this.playerCount = count;

        // Start timer when 2 players join
        if (count >= 2 && !this.timerActive) {
          this.timerActive = true;
          this.roomMessage = "Both players connected! Timer started.";

          // Tell server to start the timer
          this.socket.emit("start-timer");
        } else if (count === 1) {
          this.roomMessage = "Waiting for another player to join...";
          this.timerActive = false;
        }

        // Force p5.js to redraw the canvas
        redraw();
      });

      // Listen for join confirmation
      this.socket.on("room-joined", (roomCode) => {
        this.roomCode = roomCode;
        this.roomJoined = true;
        this.roomMessage = "Successfully joined room " + roomCode;
        console.log("Joined room:", roomCode);
      });

      // Listen for join errors
      this.socket.on("join-error", (message) => {
        this.roomMessage = message;
        console.log("Join error:", message);
      });

      console.log("Room Manager initialized");
    }
    return this;
  },

  // Create a new room
  createRoom: async function () {
    try {
      const response = await fetch("http://localhost:3000/create-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      this.roomCode = data.roomCode;
      this.roomJoined = true;
      this.roomMessage = "Room created. Waiting for other player...";

      // Auto-join the room you just created
      this.socket.emit("join-room", this.roomCode);

      console.log("Room Code:", this.roomCode);
      return this.roomCode;
    } catch (error) {
      console.error("Error creating room:", error);
      this.roomMessage = "Error creating room. Please try again.";
      return null;
    }
  },

  // Join an existing room
  joinRoom: function () {
    if (this.inputRoomCode.length === 5) {
      this.socket.emit("join-room", this.inputRoomCode);
      this.roomMessage = "Attempting to join room...";
      return true;
    } else {
      this.roomMessage = "Room code must be 5 characters";
      return false;
    }
  },

  // Update input room code
  updateInputCode: function (key) {
    if (key === "BACKSPACE") {
      this.inputRoomCode = this.inputRoomCode.slice(0, -1);
    } else if (key === "ENTER") {
      this.joinRoom();
    } else if (this.inputRoomCode.length < 5 && key.length === 1) {
      this.inputRoomCode += key.toUpperCase();
    }
  },

  // Draw the room code interface
  drawRoomCode: function (width, height) {
    background(240);
    textAlign(CENTER, CENTER);
    rectMode(CENTER);

    // Helper function to check if mouse is over a rectangle
    const isHovered = (x, y, w, h) => {
      return (
        mouseX > x - w / 2 &&
        mouseX < x + w / 2 &&
        mouseY > y - h / 2 &&
        mouseY < y + h / 2
      );
    };

    // Helper function to get button colors based on state
    const getButtonColors = (
      defaultColor,
      hoverColor,
      isHovered,
      isPressed
    ) => {
      if (isPressed && isHovered) {
        return color(
          hoverColor[0] * 0.8,
          hoverColor[1] * 0.8,
          hoverColor[2] * 0.8
        );
      } else if (isHovered) {
        return color(hoverColor[0], hoverColor[1], hoverColor[2]);
      }
      return color(defaultColor[0], defaultColor[1], defaultColor[2]);
    };

    // Title
    fill("black");
    textSize(36);
    text("Invite Friends", width / 2, 40);

    // Room code display
    fill("grey");
    textSize(24);
    text("Room Code:", width / 2, 80);

    fill(0);
    textSize(32);
    strokeWeight(0);
    text(this.roomCode || "----", width / 2, 120);

    // Input section
    fill(0);
    textSize(24);
    text("Join Room:", width / 2, 230);

    // Input field
    const inputHovered = isHovered(width / 2, 275, 200, 50);
    fill(255);
    stroke(inputHovered ? color(80, 120, 255) : 100);
    strokeWeight(inputHovered ? 3 : 2);
    rect(width / 2, 275, 200, 50, 10);

    fill(0);
    textSize(28);
    strokeWeight(0);
    text(this.inputRoomCode, width / 2, 275);

    // Join button (now using blue colors)
    const joinHovered = isHovered(width / 2, 342, 120, 45);
    const joinPressed = joinHovered && mouseIsPressed;
    const joinDefaultColor = [80, 150, 255]; // Same blue as previous copy button
    const joinHoverColor = [100, 170, 255]; // Same hover blue as previous copy button

    fill(
      getButtonColors(
        joinDefaultColor,
        joinHoverColor,
        joinHovered,
        joinPressed
      )
    );
    stroke(60, 100, 200); // Same stroke as previous copy button
    strokeWeight(joinHovered ? 3 : 2);
    rect(width / 2, 342, 120, 45, 10);

    fill(255);
    textSize(24);
    strokeWeight(0);
    text("Join", width / 2, 342);

    // Player indicator with dynamic color based on count
    const playerColor =
      this.playerCount === 0
        ? [200, 50, 50]
        : this.playerCount === 1
        ? [200, 200, 50]
        : [50, 200, 50];

    // Enhanced pulsing effect
    const pulseSize = sin(frameCount * 0.1) * 5;
    fill(playerColor[0], playerColor[1], playerColor[2]);
    stroke(0);
    strokeWeight(1);
    ellipse(width - 70, 50, 40 + pulseSize, 40 + pulseSize);

    // Player count text
    fill(255);
    textSize(20);
    strokeWeight(0);
    text(this.playerCount, width - 70, 50);

    // Player status text
    fill(0);
    textSize(14);
    text("Players", width - 70, 80);

    // Status message below player count
    fill(0);
    textSize(12);
    text(
      this.playerCount === 0
        ? "Waiting for players..."
        : this.playerCount === 1
        ? "One player joined"
        : "Room is full!",
      width - 70,
      100
    );

    // Timer display
    fill(50, 50, 50);
    textSize(24);
    text("Timer:", width / 2, 390);

    if (this.timerActive) {
      fill(50, 150, 50);
    } else {
      fill(150, 50, 50);
    }

    textSize(48);
    text(this.timer, width / 2, 430);

    // Status message
    fill(this.roomJoined ? 50 : 200, this.roomJoined ? 150 : 50);
    textSize(18);
    text(this.roomMessage, width / 2, height - 40);
  },
};
