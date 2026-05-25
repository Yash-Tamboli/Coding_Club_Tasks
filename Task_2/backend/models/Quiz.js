const mongoose = require("mongoose");

const SlideSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ["info", "multiple-choice", "qna"],
  },
  question: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    default: [],
  },
  correctAnswerIndex: {
    type: Number,
    default: null,
  },
  timeLimit: {
    type: Number,
    default: 20,
  },
});

const QuizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    default: "Untitled Quiz",
  },
  slides: [SlideSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Quiz", QuizSchema);
