const express = require('express');
const router = express.Router();
const JournalEntry = require('../models/journalEntry');

router.post('/journal', async (req, res) => {
  try {
    const { prompt, response, timestamp } = req.body;
    const entry = new JournalEntry({ prompt, response, timestamp });
    await entry.save();
    res.status(201).json({ message: 'Journal entry saved.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save journal entry.' });
  }
});

router.get('/journal', async (req, res) => {
  try {
    const entries = await JournalEntry.find().sort({ timestamp: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch journal entries.' });
  }
});

module.exports = router;