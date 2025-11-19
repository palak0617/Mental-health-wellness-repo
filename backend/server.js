require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const journalRoutes = require('./routes/journalRoutes');
const geminiRoutes = require('./routes/geminiRoutes');
const authRoutes = require('./routes/authRoutes');
const gameRecordRoutes = require('./routes/gameRecordRoutes');

const app = express();

// CORS: Allow all origins for now
app.use(cors({ origin: '*' }));
app.use(express.json());

// Routes
app.use(journalRoutes);
app.use(geminiRoutes);
app.use("/auth", authRoutes);
app.use(gameRecordRoutes);

// Base route
app.get('/', (req, res) => res.send('MindEase backend running.'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");

    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch(err => {
    console.error("❌ MongoDB connection error:", err);
  });
