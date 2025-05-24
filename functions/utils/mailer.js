const nodemailer = require("nodemailer");
const { defineSecret } = require("firebase-functions/params");

// Define secrets
const emailUser = process.env.EMAIL_USER || defineSecret("EMAIL_USER").value();
const emailPass = process.env.EMAIL_PASS || defineSecret("EMAIL_PASS").value();

// Create and export the transporter function that uses the secrets
function createTransporter() {
  return nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });
}

async function sendSignupNotification({ email, name, phone }) {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: `"Zymo App" <${emailUser}>`,
    to: "Anupam@zymo.app",
    subject: "New Customer Signup on Zymo",
    text: `New customer signed up:\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}`,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = {
  sendSignupNotification,
  emailUser,
  emailPass
};
