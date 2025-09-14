// mail.js
import nodemailer from "nodemailer";

// Utility function to generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP mail
export async function sendOTP(email) {
  const otp = generateOTP();

  // Configure transporter (using Gmail here as example)
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Your App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP sent to ${email}: ${otp}`);
    return otp; // return OTP so you can save/verify later
  } catch (error) {
    console.error("❌ Error sending OTP:", error);
    throw error;
  }
}
