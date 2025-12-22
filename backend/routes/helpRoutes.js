const express = require("express");
const router = express.Router();
const Help = require("../models/Help");

router.post("/", async (req, res) => {
  console.log("🔥 HELP ROUTE HIT");
  console.log("📦 req.body:", req.body);

  try {
    const { name, email, phone, message } = req.body;

    const newHelp = new Help({ name, email, phone, message });
    await newHelp.save();

    console.log("✅ Saved to DB");
    res.status(201).json({ success: true });
  } catch (err) {
    console.error("❌ Error saving help:", err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
