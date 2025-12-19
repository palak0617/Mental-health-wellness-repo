const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");  // <-- IMPORTANT


/* ------------------ SIGNUP ------------------ */

router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const existing = await User.findOne({ email });
    if (existing)
      return res.json({ success: false, message: "User already exists" });

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create user
    await User.create({ username, email, password: hashed });

    res.json({ success: true, message: "Signup successful" });

  } catch (err) {
    console.error("SIGNUP ERROR:", err);
    res.json({ success: false, message: "Signup failed" });
  }
});


/* ------------------ LOGIN ------------------ */

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.json({ success: false, message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.json({ success: false, message: "Incorrect password" });

    // Generate JWT Token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email
      }
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.json({ success: false, message: "Login failed" });
  }
});


/* ------------------ GET LOGGED-IN USER ------------------ */
/* Requires token in Authorization header */

router.get("/user", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("username email _id");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      success: true,
      user,
    });
  } catch (err) {
    console.error("User fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});



/* ------------------ EXPORT ROUTER ------------------ */

module.exports = router;
