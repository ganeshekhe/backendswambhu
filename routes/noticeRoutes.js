const express = require("express");
const router = express.Router();
const Notice = require("../models/Notice");

// GET all notices
router.get("/", async (req, res) => {
  try {
    const notices = await Notice.find().sort({ date: -1 });
    res.json(notices);
  } catch (err) {
    res.status(500).json({ message: "Error fetching notices" });
  }
});

// POST new notice (for admin)
router.post("/", async (req, res) => {
  try {
    const { title } = req.body;
    const notice = new Notice({ title });
    await notice.save();
    res.status(201).json(notice);
  } catch (err) {
    res.status(500).json({ message: "Error adding notice" });
  }
});

module.exports = router;


