const express = require('express');
const router = express.Router();
const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;


// --- Modular Gemini API call with retry and fallback ---
async function callGeminiWithRetry(promptText, fallback, extractFn) {
  const makeCall = async () => {
    try {
      const response = await axios.post(
        GEMINI_API_URL,
        {
          contents: [{ parts: [{ text: promptText }] }]
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000,
          family: 4
        }
      );
      console.log('✅ Gemini raw response:', JSON.stringify(response.data, null, 2));
      return extractFn(response.data);
    } catch (err) {
      if (err.response) {
        console.error('❌ Gemini API Error:', err.response.status, err.response.data);
      } else if (err.request) {
        console.error('❌ Gemini API No Response:', err.message);
      } else {
        console.error('❌ Gemini API Unknown Error:', err.message);
      }
      throw err;
    }
  };

  try {
    return await makeCall();
  } catch (err) {
    // Wait 2 seconds and retry
    await new Promise(res => setTimeout(res, 2000));
    try {
      return await makeCall();
    } catch (err2) {
      console.error('⚠️ Gemini API failed after retry. Using fallback.');
      return fallback;
    }
  }
}

// --- Extraction helpers ---
function extractGeminiText(data) {
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// Journal Prompts
router.post('/generate/journal-prompts', async (req, res) => {
  const prompt = "Generate 3 short, reflective journaling prompts to help a college student manage stress and anxiety.";
  const fallback = "What has been on your mind lately? Let’s explore that.";
  try {
    const result = await callGeminiWithRetry(prompt, fallback, extractGeminiText);
    res.json({ prompt: result });
  } catch (err) {
    res.json({ prompt: fallback });
  }
});

// Motivation
router.post('/generate/motivation', async (req, res) => {
  const prompt = "Give a short, uplifting motivational quote for a college student who feels overwhelmed or self-doubting.";
  const fallback = "Every step you take, no matter how small, is progress.";
  try {
    const result = await callGeminiWithRetry(prompt, fallback, extractGeminiText);
    res.json({ quote: result });
  } catch (err) {
    res.json({ quote: fallback });
  }
});

// Empathetic Reply
router.post('/generate/empathetic-reply', async (req, res) => {
  const { message } = req.body;
  const prompt = `You're a friendly and supportive mental wellness chatbot. Respond empathetically to the following user message: "${message}"`;
  const fallback = "I'm still here for you. Even when the tech acts up, your feelings matter.";
  try {
    const result = await callGeminiWithRetry(prompt, fallback, extractGeminiText);
    res.json({ reply: result });
  } catch (err) {
    res.json({ reply: fallback });
  }
});

module.exports = router;
