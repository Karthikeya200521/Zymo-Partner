const express = require("express");
const axios = require("axios");
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const router = express.Router();
const sendSignupNotification = require("../utils/mailer");

const db = admin.firestore();

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
      error: "API key for 2Factor is not configured",
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
  const { sessionId, otp, email, name, phone } = req.body;

  if (!otp || otp.length !== 6) {
    return res.status(400).json({
      success: false,
      error: "Invalid OTP length",
    });
  }

  try {
    const response = await axios.get(
      `https://2factor.in/API/V1/${API_KEY}/SMS/VERIFY/${sessionId}/${otp}`
    );

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

    if (response.data.Status === "Success") {
      const uid = "uid_" + Math.random().toString(36).substring(2, 15);

      await db.collection("customers").doc(uid).set({
        phone: phone,
        email: email,
        name: name,
        createdAt: new Date().toISOString(),
      });

      // ✅ Send notification email
      await sendSignupNotification(email);

      return res.json({
        success: true,
        verified: true,
        uid: uid,
      });
    }

    res.status(400).json({
      success: false,
      error: "OTP verification failed",
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
