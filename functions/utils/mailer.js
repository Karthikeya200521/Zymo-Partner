const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,  // sender email from .env
    pass: process.env.EMAIL_PASS,  // app password from .env
  },
});

async function sendSignupNotification({ email, name, phone }) {
  const mailOptions = {
    from: `"Zymo App" <${process.env.EMAIL_USER}>`,
    to: "Anupam@zymo.app", 
    subject: "New Customer Signup on Zymo",
    text: `New customer signed up:\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}`,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = sendSignupNotification;
