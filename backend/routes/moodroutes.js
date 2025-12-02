// routes/moodRoutes.js
const express = require('express');
const router = express.Router();
const Mood = require('../models/Mood');

// Get all moods for a user
router.get('/mood/:userId', async (req, res) => {
  try {
    const { limit = 30 } = req.query;
    const moods = await Mood.find({ userId: req.params.userId })
      .sort({ timestamp: -1 })

      .limit(parseInt(limit));
    res.json(moods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get mood statistics
router.get('/mood/:userId/stats', async (req, res) => {
  try {
    const { timeframe = '30' } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(timeframe));

    const moods = await Mood.find({
      userId: req.params.userId,
      timestamp: { $gte: daysAgo }
    }).sort({ timestamp: -1 });

    // Calculate mood counts
    const moodCounts = {
      great: moods.filter(m => m.mood === 'great').length,
      good: moods.filter(m => m.mood === 'good').length,
      okay: moods.filter(m => m.mood === 'okay').length,
      bad: moods.filter(m => m.mood === 'bad').length,
      terrible: moods.filter(m => m.mood === 'terrible').length,
    };

    // Calculate average intensity
    const avgIntensity = moods.length > 0
      ? moods.reduce((sum, m) => sum + m.intensity, 0) / moods.length
      : 0;

    // Get most common activities
    const activityCounts = {};
    moods.forEach(mood => {
      mood.activities.forEach(activity => {
        activityCounts[activity] = (activityCounts[activity] || 0) + 1;
      });
    });

    const topActivities = Object.entries(activityCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([activity, count]) => ({ activity, count }));

    // Get mood trend (last 7 days)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayMoods = moods.filter(m => {
        const moodDate = new Date(m.timestamp);
        return moodDate >= date && moodDate < nextDate;
      });

      const moodValues = { great: 5, good: 4, okay: 3, bad: 2, terrible: 1 };
      const avgMood = dayMoods.length > 0
        ? dayMoods.reduce((sum, m) => sum + moodValues[m.mood], 0) / dayMoods.length
        : null;

      last7Days.push({
        date: date.toISOString().split('T')[0],
        avgMood,
        count: dayMoods.length
      });
    }

    res.json({
      total: moods.length,
      moodCounts,
      avgIntensity: avgIntensity.toFixed(1),
      topActivities,
      moodTrend: last7Days,
      recentMoods: moods.slice(0, 5)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new mood entry
router.post('/mood', async (req, res) => {
  try {
    const mood = new Mood({
      userId: req.body.userId,
      mood: req.body.mood,
      intensity: req.body.intensity || 5,
      note: req.body.note,
      activities: req.body.activities || [],
      triggers: req.body.triggers || [],
      timestamp: req.body.timestamp || new Date()
    });

    const newMood = await mood.save();
    res.status(201).json(newMood);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a mood entry
router.patch('/mood/:id', async (req, res) => {
  try {
    const mood = await Mood.findById(req.params.id);
    if (!mood) {
      return res.status(404).json({ message: 'Mood not found' });
    }

    if (req.body.mood) mood.mood = req.body.mood;
    if (req.body.intensity) mood.intensity = req.body.intensity;
    if (req.body.note !== undefined) mood.note = req.body.note;
    if (req.body.activities) mood.activities = req.body.activities;
    if (req.body.triggers) mood.triggers = req.body.triggers;

    const updatedMood = await mood.save();
    res.json(updatedMood);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a mood entry
router.delete('/mood/:id', async (req, res) => {
  try {
    const mood = await Mood.findById(req.params.id);
    if (!mood) {
      return res.status(404).json({ message: 'Mood not found' });
    }

    await mood.deleteOne();
    res.json({ message: 'Mood deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;