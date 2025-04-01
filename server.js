const express = require("express");
const path = require("path");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const port = 3000;

// Serve static files from the public directory
app.use(
  express.static(path.join(__dirname, "public"), {
    setHeaders: (res, path) => {
      if (path.endsWith(".css")) {
        res.setHeader("Content-Type", "text/css");
      }
    },
  })
);

window.onload = () => {
  console.log("p5.party loaded:", typeof partyConnect !== "undefined");
};

// Route for the root path
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Track connected players and their roles
let connectedPlayers = new Map();

io.on("connection", (socket) => {
  console.log("A player connected");

  // Handle room joining
  socket.on("joinRoom", (roomName) => {
    // Leave any existing rooms
    socket.rooms.forEach((room) => {
      socket.leave(room);
    });

    // Join the specified room
    socket.join(roomName);
    console.log(`Player ${socket.id} joined room ${roomName}`);

    // Get players in the room
    const room = io.sockets.adapter.rooms.get(roomName);
    const playerCount = room ? room.size : 0;

    // Check if room is full
    if (playerCount > 2) {
      socket.emit("partyFull");
      socket.disconnect();
      return;
    }

    // Add player to connected players
    connectedPlayers.set(socket.id, { role: null });
    socket.emit("playerJoined", {
      playerId: socket.id,
      playerCount: playerCount,
    });

    // Notify other players in the room
    socket.to(roomName).emit("playerJoined", {
      playerId: socket.id,
      playerCount: playerCount,
    });
  });

  // Handle player role selection
  socket.on("selectRole", (role) => {
    // Check if role is already taken in the room
    const room = Array.from(socket.rooms)[0]; // Get the first room the player is in
    const playersInRoom = Array.from(io.sockets.adapter.rooms.get(room) || []);
    const roleTaken = playersInRoom.some(
      (playerId) => connectedPlayers.get(playerId)?.role === role
    );

    if (roleTaken) {
      socket.emit("roleTaken", { role });
      return;
    }

    // Update player's role
    connectedPlayers.get(socket.id).role = role;
    socket.emit("roleSelected", { playerId: socket.id, role: role });
    socket.to(room).emit("roleSelected", { playerId: socket.id, role: role });
  });

  // Handle game state updates
  socket.on("updateGameState", (gameState) => {
    const room = Array.from(socket.rooms)[0];
    // Broadcast the game state to all players in the room
    socket.to(room).emit("gameStateUpdated", gameState);
  });

  // Handle timer updates
  socket.on("updateTimer", (timeRemaining) => {
    const room = Array.from(socket.rooms)[0];
    // Broadcast the timer update to all players in the room
    socket.to(room).emit("timerUpdated", timeRemaining);
  });

  // Handle game over
  socket.on("gameOver", (data) => {
    const room = Array.from(socket.rooms)[0];
    // Broadcast game over to all players in the room
    socket.to(room).emit("gameOver", data);
  });

  // Handle game reset
  socket.on("gameReset", () => {
    const room = Array.from(socket.rooms)[0];
    // Broadcast game reset to all players in the room
    socket.to(room).emit("gameReset");
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("A player disconnected");
    const room = Array.from(socket.rooms)[0];
    connectedPlayers.delete(socket.id);
    if (room) {
      const playerCount = io.sockets.adapter.rooms.get(room)?.size || 0;
      socket.to(room).emit("playerLeft", {
        playerId: socket.id,
        playerCount: playerCount,
      });
    }
  });
});

// Start the server
http.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
