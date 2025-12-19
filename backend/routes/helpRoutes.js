const express = require("express");
const router = express.Router();
const Help = require("../models/Help");

console.log("📩 helpRoutes loaded");

// IMPORTANT: Route MUST start exactly like this:
router.post("/", async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;

        const newHelp = new Help({ name, email, phone, message });
        await newHelp.save();

        res.status(201).json({ success: true, message: "Help request saved" });
    } catch (error) {
        console.error("Error saving help request:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

module.exports = router;
