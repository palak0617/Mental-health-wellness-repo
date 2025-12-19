require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const journalRoutes = require('./routes/journalRoutes');
const geminiRoutes = require('./routes/geminiRoutes');
const authRoutes = require('./routes/authRoutes');
const gameRecordRoutes = require('./routes/gameRecordRoutes');
const locationRoutes = require('./routes/locationRoutes');
const moodRoutes = require('./routes/moodRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const goalRoutes = require('./routes/goalRoutes');
console.log("✅ moodRoutes loaded:", typeof moodRoutes);



const app = express();

// CORS: Allow all origins for now
// app.use(cors({ origin: '*' }));
app.use(cors({
  origin: "http://127.0.0.1:5501",
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));


app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/api/mood", moodRoutes);
app.use("/api/game-records", gameRecordRoutes);
app.use("/api/journal", journalRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/gemini", geminiRoutes);



// >>>>>>> Stashed changes


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
// console.log("journalRoutes:", typeof journalRoutes);
// console.log("geminiRoutes:", typeof geminiRoutes);
// console.log("authRoutes:", typeof authRoutes);
// console.log("gameRecordRoutes:", typeof gameRecordRoutes);
// console.log("locationRoutes:", typeof locationRoutes);

