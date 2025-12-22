const express = require("express");
const router = express.Router();
const GameRecord = require("../models/GameRecord");
const auth = require("../middleware/auth");

// Save game record
router.post("/", auth, async (req, res) => {
  try {
    const { points, time, moves } = req.body;

    const newRecord = new GameRecord({
      userId: req.user.id,   // taken from JWT token
      points,
      time,
      moves
    });

    await newRecord.save();

    res.json({ success: true, message: "Record saved", record: newRecord });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err });
  }
});

// Get leaderboard
router.get("/", async (req, res) => {
  try {
    const records = await GameRecord.find()
      .populate("userId", "username")
      .sort({ points: -1, time: 1 });

    res.json({ success: true, records });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


module.exports = router;
