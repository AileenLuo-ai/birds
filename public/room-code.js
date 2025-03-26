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

  // Copy room code to clipboard
  copyRoomCode: function () {
    if (navigator.clipboard && this.roomCode) {
      navigator.clipboard.writeText(this.roomCode);
      this.copied = true;
      setTimeout(() => (this.copied = false), 1000);
      return true;
    }
    return false;
  },

  // Draw the room code interface
  drawRoomCode: function (width, height) {
    background(240);
    textAlign(CENTER, CENTER);

    // Title
    fill(30, 100, 200);
    textSize(36);
    text("Room Management", width / 2, 40);

    // Display room info section
    fill(0);
    textSize(24);
    text("Room Code:", width / 2, 80);

    // Display the room code in a box
    fill(255);
    stroke(100);
    strokeWeight(2);
    rect(width / 2 - 100, 95, 200, 50, 10);
    fill(0);
    textSize(32);
    strokeWeight(0);
    text(this.roomCode || "----", width / 2, 120);

    // Copy button
    fill(this.copied ? 100 : 80, this.copied ? 200 : 150, 255);
    stroke(60, 100, 200);
    strokeWeight(2);
    rect(width / 2 - 50, 160, 100, 40, 10);
    fill(255);
    textSize(20);
    strokeWeight(0);
    text(this.copied ? "Copied!" : "Copy", width / 2, 180);

    // Input section
    fill(0);
    textSize(24);
    text("Join Room:", width / 2, 230);

    // Input field
    fill(255);
    stroke(100);
    strokeWeight(2);
    rect(width / 2 - 100, 250, 200, 50, 10);
    fill(0);
    textSize(28);
    strokeWeight(0);
    text(this.inputRoomCode, width / 2, 275);

    // Join button
    fill(60, 180, 60);
    stroke(30, 150, 30);
    strokeWeight(2);
    rect(width / 2 - 60, 320, 120, 45, 10);
    fill(255);
    textSize(24);
    strokeWeight(0);
    text("Join", width / 2, 342);

    // Player indicator
    const playerColor =
      this.playerCount === 0
        ? [200, 50, 50]
        : this.playerCount === 1
        ? [200, 200, 50]
        : [50, 200, 50];

    // Player count circle
    fill(playerColor[0], playerColor[1], playerColor[2]);
    stroke(0);
    strokeWeight(1);
    ellipse(width - 60, 40, 40, 40);

    // Player count text
    fill(255);
    textSize(20);
    strokeWeight(0);
    text(this.playerCount, width - 60, 40);

    // Player count label
    fill(0);
    textSize(16);
    text("Players", width - 60, 65);

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
    fill(this.roomJoined ? 50 : 200, this.roomJoined ? 150 : 50, 50);
    textSize(18);
    text(this.roomMessage, width / 2, height - 40);
  },
};
