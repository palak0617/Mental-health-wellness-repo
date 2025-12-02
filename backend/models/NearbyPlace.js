const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  name: String,
  category: String,
  address: String,
  latitude: Number,
  longitude: Number,
  source: String, // OSM / Google
  fetchedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("NearbyPlace", placeSchema);
