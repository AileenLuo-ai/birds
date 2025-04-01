const express = require("express");
const path = require("path");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const port = 3000;

// Serve static files from the public directory
app.use(express.static("public"));

// Store active parties
const parties = new Map();

// Function to find or create a party
function findOrCreateParty() {
  // Look for a party with space
  for (const [partyId, party] of parties.entries()) {
    if (party.players.length < 2) {
      return { partyId, party };
    }
  }

  // If no party with space exists, create a new one
  const partyId = Math.random().toString(36).substring(7);
  const party = {
    players: [],
    isFull: false,
    roles: new Set(), // Track selected roles
  };
  parties.set(partyId, party);
  return { partyId, party };
}

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("findParty", () => {
    const { partyId, party } = findOrCreateParty();

    // Add player to party
    party.players.push(socket.id);
    party.isFull = party.players.length >= 2;

    // Notify the player about their party
    socket.emit("partyFound", {
      partyId,
      players: party.players,
      isFull: party.isFull,
    });

    // Notify other players in the party
    party.players.forEach((playerId) => {
      if (playerId !== socket.id) {
        io.to(playerId).emit("playerJoined", {
          playerId: socket.id,
          partyId,
        });
      }
    });

    // Log party status
    console.log(`Party ${partyId} status:`, {
      players: party.players,
      isFull: party.isFull,
    });
  });

  socket.on("selectRole", (data) => {
    const { role, partyId } = data;
    const party = parties.get(partyId);

    if (party) {
      // Check if role is already taken
      if (party.roles.has(role)) {
        socket.emit("roleTaken", { role });
        return;
      }

      // Add role to party
      party.roles.add(role);

      // Notify all players in the party about the role selection
      party.players.forEach((playerId) => {
        io.to(playerId).emit("roleSelected", {
          role,
          playerId: socket.id,
        });
      });

      // Log role selection
      console.log(
        `Player ${socket.id} selected role ${role} in party ${partyId}`
      );
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    // Find and remove player from their party
    for (const [partyId, party] of parties.entries()) {
      const playerIndex = party.players.indexOf(socket.id);
      if (playerIndex !== -1) {
        party.players.splice(playerIndex, 1);
        party.isFull = false;
        party.roles.clear(); // Clear roles when a player leaves

        // Notify remaining players
        party.players.forEach((playerId) => {
          io.to(playerId).emit("playerLeft", {
            playerId: socket.id,
            partyId,
          });
        });

        // Remove empty parties
        if (party.players.length === 0) {
          parties.delete(partyId);
        }
        break;
      }
    }
  });
});

// Start the server
http.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
