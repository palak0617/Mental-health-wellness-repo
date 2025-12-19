// models/Mood.js
const mongoose = require('mongoose');

const moodSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mood: {
    type: String,
    required: true,
    enum: ['great', 'good', 'okay', 'bad', 'terrible']
  },
  intensity: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  note: {
    type: String,
    maxlength: 1000
  },
  activities: [{
    type: String
  }],
  triggers: [{
    type: String
  }],
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
moodSchema.index({ userId: 1, date: -1 });

module.exports =mongoose.models.Mood ||  mongoose.model('Mood', moodSchema);