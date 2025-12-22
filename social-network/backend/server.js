const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./src/routes/auth");
const userRoutes = require("./src/routes/user");
const postRoutes = require("./src/routes/post");
const messageRoutes = require("./src/routes/messages");
const uploadRoute = require("./src/routes/upload");

const app = express();
const server = http.createServer(app);

// Cấu hình Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 5000;

// Route Upload (Static folder)
app.use("/images", express.static(path.join(__dirname, "public/images")));

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

// Kết nối DB (Thêm retry nếu rớt mạng)
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    setTimeout(connectDB, 5000);
  }
};
connectDB();

// Routes API
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/upload", uploadRoute);

// --- SOCKET.IO LOGIC ---
let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  console.log("a user connected.");

  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  });

  // --- SỬA ĐOẠN NÀY (Thêm media) ---
  socket.on("sendMessage", ({ senderId, receiverId, text, media }) => {
    const user = getUser(receiverId);
    
    if (user) {
      io.to(user.socketId).emit("getMessage", {
        senderId,
        text,
        media, // Gửi tên file ảnh/video đi
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("a user disconnected!");
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});