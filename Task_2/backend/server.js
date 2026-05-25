const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const mongoose = require("mongoose");

mongoose
  .connect("mongodb://127.0.0.1:27017/kahoot-clone")

  .then(() => console.log("✅ Connected to MongoDB"))

  .catch((err) => console.error("❌ MongoDB connection error:", err));

const quizSchema = new mongoose.Schema({
  title: String,

  slides: Array,
});

const Quiz = mongoose.model("Quiz", quizSchema);

app.post("/api/quizzes", async (req, res) => {
  try {
    const newQuiz = new Quiz(req.body);

    await newQuiz.save();

    res.status(201).json({ message: "Quiz saved!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to save quiz" });
  }
});

app.get("/api/quizzes", async (req, res) => {
  try {
    const quizzes = await Quiz.find().sort({ _id: -1 });

    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch quizzes" });
  }
});

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`🟢 New connection: ${socket.id}`);

  socket.on("create-room", (pin) => {
    socket.join(pin);
    console.log(`🏠 Host opened room: ${pin}`);
  });

  socket.on("join-room", ({ pin, nickname }) => {
    socket.join(pin);
    console.log(`👋 ${nickname} joined room ${pin}`);
    io.to(pin).emit("player-joined", nickname);
  });

  socket.on("kick-player", ({ pin, nickname }) => {
    io.to(pin).emit("player-was-kicked", nickname);
  });

  socket.on("start-game", (pin) => {
    io.to(pin).emit("game-started");
  });

  socket.on("submit-answer", ({ pin, nickname, answerIndex }) => {
    console.log(
      `📩 ${nickname} submitted answer ${answerIndex} in room ${pin}`,
    );

    io.to(pin).emit("player-answered", { nickname, answerIndex });
  });

  socket.on("next-slide", (pin) => {
    io.to(pin).emit("new-slide-started");
  });

  socket.on("end-game", (pin) => {
    io.to(pin).emit("game-over");
  });

  socket.on("sync-slide-type", ({ pin, type }) => {
    io.to(pin).emit("slide-type-update", type);
  });

  socket.on("submit-qna", ({ pin, nickname, text }) => {
    io.to(pin).emit("receive-qna", { id: Date.now(), nickname, text });
  });

  socket.on("sync-presenter", (syncData) => {
    io.to(syncData.pin).emit("presenter-update", syncData);
  });

  socket.on("disconnect", () => {
    console.log(`🔴 User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});
