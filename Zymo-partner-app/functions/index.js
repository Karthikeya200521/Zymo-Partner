const functions = require("firebase-functions/v2");
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({ origin: true }));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json());

const citiesRoutes = require("./routes/cities");
app.use("/cities", citiesRoutes);

exports.zymoPartner = functions.https.onRequest(app);
