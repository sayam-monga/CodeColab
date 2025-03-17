// server.js
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Store active rooms and their data
const rooms = new Map();

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle joining a room
  socket.on("join-room", ({ roomId, userName }) => {
    socket.join(roomId);
    console.log(`User ${userName} (${socket.id}) joined room ${roomId}`);

    // Initialize room if it doesn't exist
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        code: "",
        users: new Map(),
        drawingData: [],
        pointers: new Map(),
      });
    }

    const room = rooms.get(roomId);
    room.users.set(socket.id, {
      id: socket.id,
      name: userName,
      joinedAt: new Date(),
    });

    // Send current code to new user
    socket.emit("initial-code", room.code);

    // Send current users list to all users in the room
    const usersList = Array.from(room.users.values());
    io.to(roomId).emit("users-update", usersList);

    // Send current pointer positions to the new user
    if (room.pointers) {
      room.pointers.forEach((data, userId) => {
        if (userId !== socket.id) {
          socket.emit("user-pointer-move", {
            userId,
            userName: data.userName,
            position: data.position,
          });
        }
      });
    }

    // Notify others about new user
    io.to(roomId).emit("user-joined", {
      userId: socket.id,
      userName: userName,
      userCount: room.users.size,
    });
  });

  // Handle code changes
  socket.on("code-change", ({ roomId, code }) => {
    if (rooms.has(roomId)) {
      const room = rooms.get(roomId);
      room.code = code; // Update stored code
      // Broadcast to all users in room except sender
      socket.to(roomId).emit("code-update", code);
    }
  });

  // Handle cursor position updates
  socket.on("cursor-update", ({ roomId, position }) => {
    if (rooms.has(roomId)) {
      const room = rooms.get(roomId);
      const user = room.users.get(socket.id);
      if (user) {
        socket.to(roomId).emit("cursor-moved", {
          userId: socket.id,
          userName: user.name,
          position,
        });
      }
    }
  });

  // Drawing board events
  socket.on("join-drawing", ({ roomId }) => {
    socket.join(`drawing-${roomId}`);
    if (rooms.has(roomId)) {
      const room = rooms.get(roomId);
      socket.emit("initial-state", {
        drawings: room.drawingData,
        toolState: room.toolState,
      });
    }
  });

  socket.on("draw", ({ roomId, drawingData }) => {
    if (rooms.has(roomId)) {
      const room = rooms.get(roomId);
      room.drawingData.push(drawingData); // Store drawing data
      socket.to(`drawing-${roomId}`).emit("drawing-data", drawingData);
    }
  });

  socket.on("clear-canvas", ({ roomId }) => {
    if (rooms.has(roomId)) {
      const room = rooms.get(roomId);
      room.drawingData = []; // Clear drawing history
      socket.to(`drawing-${roomId}`).emit("clear-canvas");
    }
  });

  // Handle pointer movement
  socket.on(
    "pointer-move",
    ({ roomId, position, userId, userName, isDrawing }) => {
      if (rooms.has(roomId)) {
        const room = rooms.get(roomId);
        // Store the current pointer position and drawing state for the user
        if (!room.pointers) {
          room.pointers = new Map();
        }
        room.pointers.set(socket.id, {
          position,
          userName,
          isDrawing,
        });

        // Broadcast the pointer position to other users in the room
        socket.to(roomId).emit("user-pointer-move", {
          userId: socket.id,
          userName,
          position,
          isDrawing,
        });
      }
    }
  );

  socket.on("tool-state-update", ({ roomId, toolState }) => {
    if (rooms.has(roomId)) {
      const room = rooms.get(roomId);
      room.toolState = toolState;
      socket.to(roomId).emit("tool-state-update", toolState);
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);

    // Remove user from all rooms they were in
    rooms.forEach((room, roomId) => {
      if (room.users.has(socket.id)) {
        const userName = room.users.get(socket.id).name;
        room.users.delete(socket.id);

        // Send updated users list
        const usersList = Array.from(room.users.values());
        io.to(roomId).emit("users-update", usersList);

        io.to(roomId).emit("user-left", {
          userId: socket.id,
          userName: userName,
          userCount: room.users.size,
        });

        // Clean up empty rooms
        if (room.users.size === 0) {
          rooms.delete(roomId);
        }
      }
    });
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
