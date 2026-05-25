require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const Session = require("./models/Session");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

app.use(cors());
app.use(express.json());

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/kahoot_clone";
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const slides = [
  {
    type: "info",
    text: "Welcome to the IITG Coding Club Quiz! Look here at the Main Screen for questions.",
  },
  {
    type: "mcq",
    text: "Which programming language is known as the 'language of the web'?",
    options: ["Python", "Java", "C++", "JavaScript"],
    correctAnswerIndex: 3,
    timeLimit: 20,
  },
  {
    type: "mcq",
    text: "What does HTML stand for?",
    options: [
      "Hyper Text Markup Language",
      "Hot Mail",
      "How To Make Lasagna",
      "Hyperlinks and Text",
    ],
    correctAnswerIndex: 0,
    timeLimit: 20,
  },
  {
    type: "mcq",
    text: "How good is Coding Club?",
    options: ["Good", "Very Good", "Excellent", "Option B and C"],
    correctAnswerIndex: 3,
    timeLimit: 20,
  },
  {
    type: "qa",
    text: "Any questions about the club? (You shouldn't have anyways)",
  },
];

const activeTimers = {};

function startRoomTimer(pin, timeLimit) {
  if (activeTimers[pin] && activeTimers[pin].interval)
    clearInterval(activeTimers[pin].interval);

  activeTimers[pin] = { timeLeft: timeLimit, interval: null };
  io.to(pin).emit("timer_tick", activeTimers[pin].timeLeft);

  activeTimers[pin].interval = setInterval(() => {
    activeTimers[pin].timeLeft--;
    io.to(pin).emit("timer_tick", activeTimers[pin].timeLeft);

    if (activeTimers[pin].timeLeft <= 0) {
      clearInterval(activeTimers[pin].interval);
      io.to(pin).emit("time_up");
    }
  }, 1000);
}

io.on("connection", (socket) => {
  console.log(`🔌 A user connected: ${socket.id}`);

  socket.on("create_room", async (pin) => {
    try {
      socket.join(pin);
      let session = await Session.findOne({ pin: pin });
      if (!session) {
        session = new Session({ pin: pin });
        await session.save();
      }
      console.log(`📺 Host created and joined room: ${pin}`);
    } catch (error) {
      console.log(`⚠️ Room ${pin} already exists.`);
    }
  });

  socket.on("join_room", async ({ pin, nickname }) => {
    try {
      let session = await Session.findOne({ pin: pin });
      if (!session) session = new Session({ pin: pin });
      session.participants.push({ nickname: nickname, score: 0 });
      await session.save();
      socket.join(pin);
      io.to(pin).emit("update_players", session.participants);
      console.log(`📱 ${nickname} joined room ${pin}`);
    } catch (error) {
      console.error("Error joining room:", error);
    }
  });

  socket.on("start_game", async (pin) => {
    console.log(`🚀 [Room ${pin}] Game Started!`);
    await Session.updateOne({ pin: pin }, { status: "playing" });
    io.to(pin).emit("new_slide", { slide: slides[0], slideIndex: 0 });
    if (slides[0].type === "mcq") startRoomTimer(pin, slides[0].timeLimit);
  });

  socket.on("next_slide", async ({ pin, slideIndex }) => {
    if (slideIndex < slides.length) {
      console.log(
        `🔄 [Room ${pin}] State changed to: ${slides[slideIndex].type.toUpperCase()} VIEW`,
      );
      io.to(pin).emit("new_slide", {
        slide: slides[slideIndex],
        slideIndex: slideIndex,
      });
      if (slides[slideIndex].type === "mcq")
        startRoomTimer(pin, slides[slideIndex].timeLimit);
    } else {
      console.log(`🏆 [Room ${pin}] State changed to: LEADERBOARD`);
      let session = await Session.findOne({ pin: pin });
      let sortedPlayers = session.participants.sort(
        (a, b) => b.score - a.score,
      );
      io.to(pin).emit("game_over", sortedPlayers);
    }
  });

  socket.on(
    "submit_answer",
    async ({ pin, nickname, answerIndex, slideIndex }) => {
      console.log(
        `📩 [Room ${pin}] ${nickname} guessed option #${answerIndex}`,
      );
      const isCorrect = answerIndex === slides[slideIndex].correctAnswerIndex;
      let pointsEarned = 0;

      if (isCorrect) {
        const timeLeft = activeTimers[pin] ? activeTimers[pin].timeLeft : 0;
        const timeLimit = slides[slideIndex].timeLimit;
        pointsEarned = Math.round(1000 * (timeLeft / timeLimit));
        console.log(
          `🎉 ${nickname} got it RIGHT! Speed Score: +${pointsEarned}`,
        );

        await Session.updateOne(
          { pin: pin, "participants.nickname": nickname },
          { $inc: { "participants.$.score": pointsEarned } },
        );
      } else {
        console.log(`❌ ${nickname} got it WRONG.`);
      }

      let session = await Session.findOne({ pin: pin });
      let sortedPlayers = session.participants.sort(
        (a, b) => b.score - a.score,
      );
      let playerRank =
        sortedPlayers.findIndex((p) => p.nickname === nickname) + 1;
      let playerData = sortedPlayers.find((p) => p.nickname === nickname);

      socket.emit("answer_result", {
        isCorrect,
        pointsEarned,
        newScore: playerData.score,
        rank: playerRank,
      });
      io.to(pin).emit("player_answered");
    },
  );

  socket.on("submit_qa", ({ pin, nickname, questionText }) => {
    console.log(`🙋‍♂️ [Room ${pin}] ${nickname} asked: "${questionText}"`);
    io.to(pin).emit("receive_qa", { nickname, questionText });
  });

  socket.on("disconnect", () =>
    console.log(`🔴 User disconnected: ${socket.id}`),
  );
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () =>
  console.log(`🚀 Backend server running on http://localhost:${PORT}`),
);
