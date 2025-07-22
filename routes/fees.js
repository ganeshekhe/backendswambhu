const express = require("express");
const router = express.Router();
const Fee = require("../models/Fee");
const { verifyToken } = require("../middleware/authMiddleware");

// Get all fees
router.get("/", async (req, res) => {
  try {
    const fees = await Fee.find();
    res.json(fees);
  } catch (err) {
    res.status(500).json({ message: "Failed to load fees" });
  }
});

// Add or Update fee (Admin Only)
router.post("/", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied" });

  const { caste, amount } = req.body;

  try {
    const existingFee = await Fee.findOne({ caste });

    if (existingFee) {
      existingFee.amount = amount;
      await existingFee.save();
      return res.json({ message: "Fee updated", fee: existingFee });
    } else {
      const newFee = new Fee({ caste, amount });
      await newFee.save();
      return res.json({ message: "Fee added", fee: newFee });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save fee" });
  }
});

module.exports = router;
