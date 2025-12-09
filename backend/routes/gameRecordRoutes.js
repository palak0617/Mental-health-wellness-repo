const express = require("express");
const router = express.Router();
const GameRecord = require("../models/GameRecord");

// Save new record
router.post("/game-records", async (req, res) => {
  try {
    const { username, points, time, moves } = req.body;

    const record = new GameRecord({ username, points, time, moves });
    await record.save();

    res.json({ success: true, message: "Record saved!" });
  } catch (error) {
    console.error("Save record error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get leaderboard
router.get("/game-records", async (req, res) => {
  try {
    const records = await GameRecord.find()
      .sort({ points: -1, time: 1 }) // best scores first
      .limit(50);

    res.json({ success: true, records });
  } catch (error) {
    console.error("Fetch records error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
