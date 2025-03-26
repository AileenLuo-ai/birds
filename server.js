const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

// App setup
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins, change if needed
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "img-src 'self' data:;");
  next();
});

// Imports
app.use(express.static("public"));

// Room management
const rooms = {};

// Endpoint to create a room
app.post("/create-room", (req, res) => {
  const roomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
  rooms[roomCode] = { players: [], timer: 0 };
  res.json({ roomCode });
  console.log(`Room created: ${roomCode}`);
});

// Socket.io handling
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Join room
  socket.on("join-room", (roomCode) => {
    if (rooms[roomCode]) {
      socket.join(roomCode);
      rooms[roomCode].players.push(socket.id);
      io.to(roomCode).emit("player-count", rooms[roomCode].players.length);
      io.to(roomCode).emit("player-joined", rooms[roomCode].players);
      console.log(`${socket.id} joined room: ${roomCode}`);
    } else {
      socket.emit("error", "Room not found");
    }
  });

  // Timer sync
  socket.on("sync-timer", ({ roomCode, timer }) => {
    if (rooms[roomCode]) {
      rooms[roomCode].timer = timer;
      io.to(roomCode).emit("timer-updated", timer);
      console.log(`Timer updated for room ${roomCode}: ${timer}`);
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    for (const roomCode in rooms) {
      rooms[roomCode].players = rooms[roomCode].players.filter(
        (id) => id !== socket.id
      );
      io.to(roomCode).emit("player-count", rooms[roomCode].players.length);
      io.to(roomCode).emit("player-left", rooms[roomCode].players);
    }
    console.log("User disconnected:", socket.id);
  });

  // Listen for player count updates
  socket.on("player-count", (count) => {
    console.log("Player count received:", count); // Debug log
    rooms[roomCode].players = rooms[roomCode].players.filter(
      (id) => id !== socket.id
    );
    io.to(roomCode).emit("player-count", rooms[roomCode].players.length);
    io.to(roomCode).emit("player-left", rooms[roomCode].players);
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);

  // Fetch AFTER the server is running
  try {
    const response = await fetch(`http://localhost:${PORT}/create-room`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    console.log("Room Code:", data.roomCode);
  } catch (error) {
    console.error("Error:", error);
  }
});
