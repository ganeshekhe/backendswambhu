

const express = require("express");
const mongoose = require("mongoose");
const Grid = require("gridfs-stream");

const router = express.Router();

let gfs;

mongoose.connection.once("open", () => {
  gfs = Grid(mongoose.connection.db, mongoose.mongo);
  gfs.collection("uploads");
});

// GET /api/uploads/:filename - Stream file from GridFS
router.get("/:filename", (req, res) => {
  if (!gfs) {
    return res.status(500).json({ message: "GridFS not initialized yet" });
  }

  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    if (err || !file) {
      return res.status(404).json({ message: "File not found" });
    }

    const readStream = gfs.createReadStream({ filename: file.filename });

    res.set("Content-Type", file.contentType);
    res.set("Content-Disposition", `inline; filename="${file.filename}"`);

    readStream.on("error", (error) => {
      console.error("Stream error:", error);
      return res.status(500).json({ message: "Stream error" });
    });

    readStream.pipe(res);
  });
});

// ✅ VERY IMPORTANT
module.exports = router;
