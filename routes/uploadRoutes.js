const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const { verifyToken } = require("../middleware/authMiddleware");
const crypto = require("crypto");
const path = require("path");

const router = express.Router();

const mongoURI = process.env.MONGO_URI;

// Create storage engine for GridFS
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      // Generate random filename
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString("hex") + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: "uploads", // Should match GridFS collection name
        };
        resolve(fileInfo);
      });
    });
  },
});

const upload = multer({ storage });

// Init gfs once connected
let gfs;
mongoose.connection.once("open", () => {
  gfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: "uploads",
  });
});

// Upload single profile document
router.post("/profile", verifyToken, upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  res.json({
    filename: req.file.filename,
    fileId: req.file.id,
    originalname: req.file.originalname,
  });
});

// Get file by filename (download/view)
router.get("/:filename", async (req, res) => {
  try {
    const fileCursor = gfs.find({ filename: req.params.filename });
    const files = await fileCursor.toArray();

    if (!files || files.length === 0) {
      return res.status(404).json({ message: "File not found" });
    }

    const file = files[0];
    res.set("Content-Type", file.contentType);
    res.set("Content-Disposition", "inline; filename=\"" + file.filename + "\"");

    const downloadStream = gfs.openDownloadStreamByName(req.params.filename);
    downloadStream.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error retrieving file" });
  }
});

// Delete file by filename
router.delete("/:filename", verifyToken, async (req, res) => {
  try {
    const fileCursor = gfs.find({ filename: req.params.filename });
    const files = await fileCursor.toArray();

    if (!files || files.length === 0) {
      return res.status(404).json({ message: "File not found" });
    }

    const fileId = files[0]._id;

    gfs.delete(fileId, (err) => {
      if (err) return res.status(500).json({ message: "Failed to delete file" });
      res.json({ message: "File deleted successfully" });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting file" });
  }
});

module.exports = router;
