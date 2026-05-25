const express = require("express");
const router = express.Router();
const Quiz = require("../models/Quiz");

router.post("/", async (req, res) => {
  try {
    const newQuiz = new Quiz(req.body);
    const savedQuiz = await newQuiz.save();
    res.status(201).json(savedQuiz);
  } catch (err) {
    res.status(500).json({ message: "Failed to save quiz", error: err });
  }
});

router.get("/", async (req, res) => {
  try {
    const quizzes = await Quiz.find().sort({ createdAt: -1 });
    res.status(200).json(quizzes);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch quizzes", error: err });
  }
});

module.exports = router;
