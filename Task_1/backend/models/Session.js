const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  pin: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    default: "lobby",
  },
  participants: [
    {
      nickname: { type: String, required: true },
      score: { type: Number, default: 0 },
    },
  ],
});

module.exports = mongoose.model("Session", sessionSchema);
