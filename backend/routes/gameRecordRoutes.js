const express = require("express");
const router = express.Router();
const GameRecord = require("../models/GameRecord");

// Save a new record
router.post("/game-records", async (req, res) => {
  try {
    const { username, points, time } = req.body;

    const record = new GameRecord({ username, points, time });
    await record.save();

    res.json({ success: true, message: "Record saved!" });
  } catch (error) {
    console.error("Save record error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get all records sorted for leaderboard
router.get("/game-records", async (req, res) => {
  try {
    const records = await GameRecord.find()
      .sort({ points: -1, time: 1 }) // highest points first, lowest time first
      .limit(50); // limit leaderboard

    res.json({ success: true, records });
  } catch (error) {
    console.error("Fetch records error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
