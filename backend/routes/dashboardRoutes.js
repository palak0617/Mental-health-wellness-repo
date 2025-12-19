const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Mood = require("../models/Mood");
const Goal = require("../models/Goal");
const GameRecord = require("../models/GameRecord");
const JournalEntry = require("../models/journalEntry");
const authenticate = require("../middleware/auth.js");


// -------------------------------------------
// GET FULL DASHBOARD DATA
// -------------------------------------------
router.get("/", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get data
    const moods = await Mood.find({ userId });
    const goals = await Goal.find({ userId });
    const gameRecords = await GameRecord.find({ userId });

    // Today's mood
    const today = new Date().toDateString();
    const todayMood = moods.find(
      (m) => new Date(m.createdAt).toDateString() === today
    );

    // Mood scoring conversion
    const moodValues = {
      excellent: 100,
      good: 80,
      okay: 60,
      poor: 30,
    };

    const moodScore = todayMood ? moodValues[todayMood.mood] : 50;

    // Goal completion
    const totalGoals = goals.length;
    const completedGoals = goals.filter((g) => g.completed).length;
    const goalCompletion =
      totalGoals === 0 ? 0 : Math.round((completedGoals / totalGoals) * 100);

    // Game wellness score
    const avgGameScore =
      gameRecords.length === 0
        ? 50
        : Math.round(
            gameRecords.reduce((sum, r) => sum + r.score, 0) /
              gameRecords.length
          );

    // Streak
    let streak = 0;
    let dayPointer = new Date().toDateString();
    for (let m of moods.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))) {
      if (new Date(m.createdAt).toDateString() === dayPointer) {
        streak++;
        dayPointer = new Date(
          new Date(dayPointer).setDate(new Date(dayPointer).getDate() - 1)
        ).toDateString();
      } else break;
    }

    const streakScore = Math.min(streak * 10, 100); // max 10 days → 100%

    // Final REAL personalized score
    const wellnessScore = Math.round(
      moodScore * 0.4 +
        goalCompletion * 0.3 +
        avgGameScore * 0.2 +
        streakScore * 0.1
    );

    res.json({
      success: true,
      userId,
      todayMood,
      goalCompletion,
      avgGameScore,
      streak,
      wellnessScore,
      sessions: moods.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Dashboard error" });
  }
});


module.exports = router;
