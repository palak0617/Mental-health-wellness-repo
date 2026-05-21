const express = require('express');
const router = express.Router();
const Mood = require('../models/Mood');
const auth = require('../middleware/auth');

// --------------------
// CREATE mood
// POST /api/mood
// --------------------
router.post('/', auth, async (req, res) => {
  try {
    const mood = new Mood({
      userId: req.user._id,
      mood: req.body.mood,
      intensity: req.body.intensity || 5,
      note: req.body.note,
      activities: req.body.activities || [],
      triggers: req.body.triggers || [],
      //timestamp: req.body.timestamp || new Date()
    });

    const newMood = await mood.save();
    res.status(201).json(newMood);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// --------------------
// GET moods for user
// GET /api/mood/:userId
// --------------------
router.get('/:userId', async (req, res) => {
  try {
    const { limit = 30 } = req.query;

    const moods = await Mood.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json(moods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --------------------
// GET mood stats
// GET /api/mood/:userId/stats
// --------------------
router.get('/:userId/stats', async (req, res) => {
  try {
    const { timeframe = '30' } = req.query;

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(timeframe));

    const moods = await Mood.find({
      userId: req.params.userId,
      createdAt: { $gte: daysAgo }
    }).sort({ createdAt: -1 });

    const moodCounts = {
      great: moods.filter(m => m.mood === 'great').length,
      good: moods.filter(m => m.mood === 'good').length,
      okay: moods.filter(m => m.mood === 'okay').length,
      bad: moods.filter(m => m.mood === 'bad').length,
      terrible: moods.filter(m => m.mood === 'terrible').length,
    };

    const avgIntensity = moods.length
      ? moods.reduce((s, m) => s + m.intensity, 0) / moods.length
      : 0;

    // Mood trend (last 7 days)
    const moodValues = { great: 5, good: 4, okay: 3, bad: 2, terrible: 1 };
    const trend = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);

      const next = new Date(d);
      next.setDate(next.getDate() + 1);

      const dayMoods = moods.filter(m => {
        const t = new Date(m.createdAt);
        return t >= d && t < next;
      });

      const avgMood = dayMoods.length
        ? dayMoods.reduce((s, m) => s + moodValues[m.mood], 0) / dayMoods.length
        : null;

      trend.push({
        date: d.toISOString().split('T')[0],
        avgMood,
        count: dayMoods.length
      });
    }

    res.json({
      total: moods.length,
      moodCounts,
      avgIntensity: avgIntensity.toFixed(1),
      moodTrend: trend
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --------------------
// DELETE mood
// DELETE /api/mood/:id
// --------------------
router.delete('/:id', async (req, res) => {
  try {
    await Mood.findByIdAndDelete(req.params.id);
    res.json({ message: 'Mood deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
