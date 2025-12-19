const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async function (req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader)
    return res.status(401).json({ message: "Login required" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from DB (IMPORTANT FIX)
    const user = await User.findById(decoded.id).select("_id username email");

    if (!user)
      return res.status(404).json({ message: "User not found" });

    req.user = user; // NOW req.user has full data

    next();

  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
