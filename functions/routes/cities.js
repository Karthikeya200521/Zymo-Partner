const express = require("express");
const axios = require("axios");
const { defineSecret } = require("firebase-functions/params");

const router = express.Router();

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY ||  defineSecret("GOOGLE_API_KEY").value();
router.post("/indian-cities", async (req, res) => {
  console.log("GOOGLE_API_KEY:", GOOGLE_API_KEY);
  const query = req.query.query; // Default to "New" if empty
  const apiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${query}&types=(cities)&components=country:IN&key=${GOOGLE_API_KEY}`;

  try {
    const response = await axios.get(apiUrl);
    if (response.data.status === "OK") {
      const cityNames = response.data.predictions.map(
        (city) => city.description
      );
      res.json({ cities: cityNames });
    } else {
      res.json({ cities: [] });
    }
  } catch (error) {
    console.error("Error fetching cities:", error.message);
    res.status(500).json({ error: "Failed to fetch cities" });
  }
});

module.exports = router;
