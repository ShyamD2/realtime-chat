const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Serve static frontend files from /public
app.use(express.static(path.join(__dirname, "public")));

// Keep track of connected users: socket.id -> username
const users = {};

io.on("connection", (socket) => {
  console.log(`New connection: ${socket.id}`);

  // A user joins with a chosen username
  socket.on("join", (username) => {
    users[socket.id] = username || "Anonymous";
    socket.broadcast.emit("system message", `${users[socket.id]} joined the chat`);
    io.emit("user count", Object.keys(users).length);
  });

  // Broadcast a chat message to everyone (including sender)
  socket.on("chat message", (text) => {
    const username = users[socket.id] || "Anonymous";
    io.emit("chat message", {
      username,
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });
  });

  // Typing indicator
  socket.on("typing", (isTyping) => {
    const username = users[socket.id] || "Anonymous";
    socket.broadcast.emit("typing", { username, isTyping });
  });

  socket.on("disconnect", () => {
    const username = users[socket.id];
    delete users[socket.id];
    if (username) {
      socket.broadcast.emit("system message", `${username} left the chat`);
      io.emit("user count", Object.keys(users).length);
    }
    console.log(`Disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Realtime chat server running at http://localhost:${PORT}`);
});
