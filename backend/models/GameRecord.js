const mongoose = require("mongoose");

const GameRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  points: Number,
  time: Number,
  moves: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("GameRecord", GameRecordSchema);
