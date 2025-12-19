const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  name: String,
  address: String,
  lat: Number,
  lng: Number,
  rating: Number,

  createdAt: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.models.FavoritePlace || mongoose.model("FavoritePlace", favoriteSchema);
