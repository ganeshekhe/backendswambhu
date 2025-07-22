
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const HeroSlide = require("../models/HeroSlide");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ GridFS Setup
let gridfsBucket;
const conn = mongoose.connection;

conn.once("open", () => {
  gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "uploads", // must match bucketName in storage
  });
});

// ✅ GridFS Storage config
const storage = new GridFsStorage({
  url: process.env.MONGO_URI,
  file: (req, file) => ({
    filename: `${Date.now()}-${file.originalname}`,
    bucketName: "uploads",
  }),
});
const upload = multer({ storage });

// ✅ GET all slides
router.get("/", async (req, res) => {
  try {
    const slides = await HeroSlide.find().sort({ createdAt: -1 });
    res.json(slides);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch slides" });
  }
});

// ✅ POST slide
router.post("/", verifyToken, upload.single("image"), async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Access denied" });

  try {
    const { title, subtitle } = req.body;
    const file = req.file;

    const newSlide = new HeroSlide({
      title,
      subtitle,
      image: {
        filename: file.filename,
        fileId: file.id,
        uploadedAt: new Date(),
      },
    });

    await newSlide.save();
    res.json({ message: "✅ Slide uploaded", slide: newSlide });
  } catch (err) {
    console.error("Slide upload error:", err);
    res.status(500).json({ message: "Failed to upload slide" });
  }
});

// ✅ DELETE slide
router.delete("/:id", verifyToken, async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Access denied" });

  try {
    const slide = await HeroSlide.findById(req.params.id);
    if (!slide) return res.status(404).json({ message: "Slide not found" });

    // Delete from GridFS
    if (slide.image?.fileId && gridfsBucket) {
      await gridfsBucket.delete(new mongoose.Types.ObjectId(slide.image.fileId));
    }

    // Delete from database
    await HeroSlide.findByIdAndDelete(req.params.id);

    res.json({ message: "✅ Slide deleted successfully" });
  } catch (err) {
    console.error("Slide delete error:", err);
    res.status(500).json({ message: "Failed to delete slide" });
  }
});

module.exports = router;
