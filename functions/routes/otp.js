const express = require("express");
const axios = require("axios");
const functions = require("firebase-functions");
const router = express.Router();

// Using Firebase Functions config to get API key
const API_KEY = functions.config().twofactor?.apikey || process.env.TWOFACTOR_API_KEY;

// Log warning if API key is missing
if (!API_KEY) {
  console.warn("Warning: 2Factor API key not found in config");
}

router.post("/send", async (req, res) => {
  const { phone } = req.body;
  
  if (!API_KEY) {
    return res.status(500).json({
      success: false,
      error: "API key for 2Factor is not configured"
    });
  }

  try {
    const response = await axios.get(
      `https://2factor.in/API/V1/${API_KEY}/SMS/${phone}/AUTOGEN`
    );

    res.json({
      success: true,
      sessionId: response.data.Details,
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({
      success: false,
      error: "Failed to send OTP",
    });
  }
});

router.post("/verify", async (req, res) => {
  const { sessionId, otp } = req.body;

  if (otp.length !== 6 || !otp) {
    return res.status(400).json({
      success: false,
      error: "Invalid OTP length",
    });
  }

  try {
    const response = await axios.get(
      `https://2factor.in/API/V1/${API_KEY}/SMS/VERIFY/${sessionId}/${otp}`
    );

    // Handle expired OTP case
    if (
      response.data.Status === "Error" &&
      response.data.Details === "OTP Expired"
    ) {
      return res.status(400).json({
        success: false,
        error: "OTP has expired. Please request a new one.",
        expired: true,
      });
    }

    res.json({
      success: true,
      verified: response.data.Status === "Success",
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({
      success: false,
      error: "Failed to verify OTP",
    });
  }
});

module.exports = router;
