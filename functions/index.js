const { onRequest } = require("firebase-functions/v2/https");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const admin = require("firebase-admin");
admin.initializeApp();

const app = express();

const emailRoutes = require("./routes/email");
const citiesRoutes = require("./routes/cities");
const otpRoutes = require("./routes/otp");


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

// Register routes
app.use("/cities", citiesRoutes);
app.use("/otp", otpRoutes);
app.use("/email", emailRoutes);

// Export the function with v2 syntax
exports.zymoPartner = onRequest(app);
