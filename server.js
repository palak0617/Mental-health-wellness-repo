require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const journalRoutes = require('./routes/journalRoutes');
const geminiRoutes = require('./routes/geminiRoutes');

const app = express();

// CORS: Allow all origins for now. To restrict, set origin: 'https://your-netlify-app.netlify.app'
app.use(cors({ origin: '*' }));
app.use(express.json());

app.use(journalRoutes);
app.use(geminiRoutes);

app.get('/', (req, res) => res.send('MindEase backend running.'));

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(process.env.PORT || 5000, () => {
      console.log('Server running');
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });