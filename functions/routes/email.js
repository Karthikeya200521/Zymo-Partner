const express = require("express");
const router = express.Router();
const sendSignupNotification = require("../utils/mailer"); // your mailer util

// POST /email/signup-notification
router.post("/signup-notification", async (req, res) => {
  try {
    const { email, name, phone } = req.body;

    if (!email || !name || !phone) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    await sendSignupNotification({ email, name, phone });

    res.json({ success: true, message: "Signup notification email sent." });
  } catch (error) {
    console.error("Error sending signup notification email:", error);
    res.status(500).json({ success: false, error: "Failed to send email" });
  }
});

module.exports = router;
