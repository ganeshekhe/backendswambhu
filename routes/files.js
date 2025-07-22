

const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const conn = mongoose.connection;
let gfs;

conn.once("open", () => {
  gfs = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "uploads",
  });
});

router.get("/:filename", async (req, res) => {
  try {
    const file = await conn.db.collection("uploads.files").findOne({ filename: req.params.filename });
    if (!file) return res.status(404).json({ message: "File not found" });

    res.set("Content-Type", file.contentType);
    gfs.openDownloadStreamByName(req.params.filename).pipe(res);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving file" });
  }
});

module.exports = router;