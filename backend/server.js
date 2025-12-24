require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// ======================
// ROUTE IMPORTS
// ======================
const helpRoutes = require('./routes/helpRoutes'); // 🔴 IMPORTANT: keep this on top

const journalRoutes = require('./routes/journalRoutes');
const geminiRoutes = require('./routes/geminiRoutes');
const authRoutes = require('./routes/authRoutes');
const gameRecordRoutes = require('./routes/gameRecordRoutes');
const locationRoutes = require('./routes/locationRoutes');
const moodroutes = require('./routes/moodroutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const goalRoutes = require('./routes/goalRoutes');

const app = express();


// CORS: Allow all origins for now
// app.use(cors({ origin: '*' }));
app.use(cors({
  origin: [
    "http://127.0.0.1:5500",
    "http://127.0.0.1:5501",
    "http://localhost:5500",
    "http://localhost:5501"
  ],
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));



// ======================
// MIDDLEWARE
// ======================
// app.use(cors());  ✅ safest for development (prevents Contact Us CORS issues)
app.use(express.json());

// ======================
// ROUTES (ORDER MATTERS)
// ======================

// 🔴 Contact / Help route FIRST
app.use("/api/help", helpRoutes);

// Other routes
app.use("/auth", authRoutes);
app.use("/api/mood", moodroutes);
app.use("/api/game-records", gameRecordRoutes);
app.use("/api/journal", journalRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/gemini", geminiRoutes);

// ======================
// BASE ROUTE
// ======================
app.get('/', (req, res) => {
  res.send('MindEase backend running.');
});

// ======================
// DATABASE + SERVER
// ======================
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error("❌ MongoDB connection error:", err);
  });
