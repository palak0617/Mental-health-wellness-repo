const express = require("express");
const axios = require("axios");
const router = express.Router();
const Favorite = require("../models/FavoritePlace");


// ---------------- FREE OPENSTREETMAP SEARCH ----------------
router.get("/open-places", async (req, res) => {

  const { lat, lng, category, radius } = req.query;

  const map = {
    park: 'leisure="park"',
    gym: 'leisure="fitness_centre"',
    meditation: 'amenity="place_of_worship"',
    cafe: 'amenity="cafe"'
  };

  if (!map[category]) {
    return res.status(400).json({ error: "Invalid category" });
  }

  const query = `
  [out:json];
  (
    node[${map[category]}](around:${radius},${lat},${lng});
    way[${map[category]}](around:${radius},${lat},${lng});
  );
  out tags center;
  `;

  try {
    const response = await axios.post(
      "https://overpass.kumi.systems/api/interpreter",

      query,
      { headers: { "Content-Type": "text/plain" } ,
        timeout: 15000
    }
      
    );

    const results = response.data.elements.map(p => {

  const t = p.tags || {};

  const address = [
    t["addr:housenumber"],
    t["addr:street"],
    t["addr:suburb"],
    t["addr:city"],
    t["addr:postcode"]
  ].filter(Boolean).join(", ") || "Address not available";

  return {
    name: t.name || "Unnamed place",
    address: address,
    lat: p.lat || p.center?.lat,
    lng: p.lon || p.center?.lon,
    rating: Math.floor(Math.random() * 2) + 4
  };
});

  } catch (err) {
    console.error("OSM ERROR:", err.message);
    res.status(500).json({ error: "OSM API failed" });
  }

});


// ---------------- SAVE FAVORITE ----------------
router.post("/favorite", async (req, res) => {
  try {
    const fav = new Favorite(req.body);
    await fav.save();
    res.json({ message: "Saved" });
  } catch (err) {
    res.status(500).json({ error: "Failed to save favorite" });
  }
});


// ---------------- GET FAVORITES ----------------
router.get("/favorite/:userId", async (req, res) => {
  try {
    const favs = await Favorite.find({ userId: req.params.userId });
    res.json(favs);
  } catch {
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
});


// ✅ THIS LINE WAS MISSING (THIS FIXES YOUR SERVER)
module.exports = router;
