
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendSMS = require("../utils/sendSMS");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// ✅ Signup ➔ Name, Mobile, Password, Gender, DOB, Caste (optional)
router.post("/signup", async (req, res) => {
  const { name, mobile, password, gender, dob, caste } = req.body;

  try {
    const existingUser = await User.findOne({ mobile });
    if (existingUser) return res.status(400).json({ message: "❌ User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      mobile,
      password: hashedPassword,
      gender,
      dob,
      caste,
    });

    await newUser.save();

    res.status(201).json({ message: "✅ Signup successful" });
  } catch (error) {
    res.status(500).json({ message: "❌ Signup failed", error: error.message });
  }
});

// ✅ Login ➔ Mobile + Password
router.post("/login", async (req, res) => {
  const { mobile, password } = req.body;

  try {
    const user = await User.findOne({ mobile });
    if (!user) return res.status(404).json({ message: "❌ User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "❌ Invalid password" });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        mobile: user.mobile,
        gender: user.gender || "",
        dob: user.dob ? user.dob.toISOString().substring(0, 10) : "",
        caste: user.caste || "",
        profilePic: user.profilePic || null, // ✅ GridFS file info
      },
    });
  } catch (error) {
    res.status(500).json({ message: "❌ Login failed", error: error.message });
  }
});

// ✅ Send OTP ➔ For Forgot Password
router.post("/send-otp", async (req, res) => {
  const { mobile } = req.body;

  try {
    const user = await User.findOne({ mobile });
    if (!user) return res.status(404).json({ message: "❌ User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    user.otp = otp;
    user.otpExpiry = expiry;
    await user.save();

    console.log(`📤 OTP for ${mobile}: ${otp}`);
    await sendSMS(mobile, `Your OTP is ${otp}`);

    res.json({ message: "✅ OTP sent to your mobile number" });
  } catch (error) {
    res.status(500).json({ message: "❌ Failed to send OTP", error: error.message });
  }
});

// ✅ Reset Password ➔ Mobile + OTP + New Password
router.post("/reset-password", async (req, res) => {
  const { mobile, otp, newPassword } = req.body;

  try {
    const user = await User.findOne({ mobile });
    if (!user) return res.status(404).json({ message: "❌ User not found" });

    const isOtpValid = user.otp === otp && user.otpExpiry && new Date() < user.otpExpiry;
    if (!isOtpValid) return res.status(400).json({ message: "❌ Invalid or expired OTP" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    res.json({ message: "✅ Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: "❌ Failed to reset password", error: error.message });
  }
});

module.exports = router;
