// server.js
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();

// Update CORS configuration to be more permissive
app.use(
  cors({
    origin: "*", // Allow all origins in development
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
  })
);

const httpServer = createServer(app);

// Update Socket.IO configuration
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allow all origins in development
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["*"],
  },
  pingTimeout: 60000, // Increase timeout
  pingInterval: 25000,
  transports: ["websocket", "polling"], // Allow both transports
  allowEIO3: true, // Enable compatibility mode
  maxHttpBufferSize: 1e8, // Increase buffer size
  connectTimeout: 45000,
});

// Add basic health check route
app.get("/health", (req, res) => {
  res.send("Server is running");
});

// Store active rooms and their data
const rooms = new Map();

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });

  // Handle joining a room
  socket.on("join-room", ({ roomId, userName }) => {
    socket.join(roomId);
    console.log(`User ${userName} (${socket.id}) joined room ${roomId}`);

    // Initialize room if it doesn't exist
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        code: "",
        users: new Map(),
      });
    }

    const room = rooms.get(roomId);
    room.users.set(socket.id, { id: socket.id, name: userName });

    // Send current code to new user
    socket.emit("initial-code", room.code);

    // Send current users list to all users in the room
    const usersList = Array.from(room.users.values());
    io.to(roomId).emit("users-update", usersList);

    // Notify others about new user
    io.to(roomId).emit("user-joined", {
      userId: socket.id,
      userName,
      userCount: room.users.size,
    });
  });

  // Handle code changes
  socket.on("code-change", ({ roomId, code }) => {
    if (rooms.has(roomId)) {
      const room = rooms.get(roomId);
      if (room.code !== code) {
        room.code = code;
        socket.to(roomId).emit("code-update", code);
      }
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
          userName,
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

// Error handling for the server
httpServer.on("error", (error) => {
  console.error("Server error:", error);
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
