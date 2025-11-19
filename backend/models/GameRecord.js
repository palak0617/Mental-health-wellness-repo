const mongoose = require("mongoose");

const gameRecordSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    points: { type: Number, required: true },
    time: { type: Number, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("GameRecord", gameRecordSchema);
