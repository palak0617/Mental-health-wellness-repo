const mongoose = require('mongoose');

const journalEntrySchema = new mongoose.Schema({
  prompt: String,
  response: String,
  timestamp: Date
});

module.exports = mongoose.model('JournalEntry', journalEntrySchema);