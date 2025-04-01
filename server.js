const express = require("express");
const path = require("path");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const port = 3000;

// Serve static files from the public directory
app.use(express.static("public"));

// Route for the root path
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Track connected players and their roles
let connectedPlayers = new Map();

io.on("connection", (socket) => {
  console.log("A player connected");

  // Check if we already have 2 players
  if (connectedPlayers.size >= 2) {
    socket.emit("partyFull");
    socket.disconnect();
    return;
  }

  // Add player to connected players
  connectedPlayers.set(socket.id, { role: null });
  socket.emit("playerJoined", {
    playerId: socket.id,
    playerCount: connectedPlayers.size,
  });

  // Handle player role selection
  socket.on("selectRole", (role) => {
    // Check if role is already taken
    const roleTaken = Array.from(connectedPlayers.values()).some(
      (player) => player.role === role
    );

    if (roleTaken) {
      socket.emit("roleTaken", { role });
      return;
    }

    // Update player's role
    connectedPlayers.get(socket.id).role = role;
    socket.emit("roleSelected", { playerId: socket.id, role: role });
    io.emit("roleSelected", { playerId: socket.id, role: role });
  });

  // Handle game state updates
  socket.on("updateGameState", (gameState) => {
    io.emit("gameStateUpdated", gameState);
  });

  // Handle game timer updates
  socket.on("updateTimer", (timeRemaining) => {
    io.emit("timerUpdated", timeRemaining);
  });

  // Handle game over
  socket.on("gameOver", (data) => {
    io.emit("gameOver", data);
  });

  // Handle game reset
  socket.on("gameReset", () => {
    io.emit("gameReset");
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("A player disconnected");
    connectedPlayers.delete(socket.id);
    io.emit("playerLeft", {
      playerId: socket.id,
      playerCount: connectedPlayers.size,
    });
  });
});

// Start the server
http.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
