const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// Signup
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const existing = await User.findOne({ email });
    if (existing) return res.json({ success: false, message: "User already exists" });

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create user
    await User.create({ username, email, password: hashed });

    res.json({ success: true, message: "Signup successful" });

  } catch (err) {
    res.json({ success: false, message: "Signup failed" });
  }
});

// Login Route (FIXED)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.json({ success: false, message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.json({ success: false, message: "Incorrect password" });

    // Generate Token
    const jwt = require("jsonwebtoken");
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Return proper JSON shape for frontend
    return res.json({
      success: true,
      message: "Login successful",
      token,
      user
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.json({ success: false, message: "Login failed" });
  }
});


module.exports = router;
