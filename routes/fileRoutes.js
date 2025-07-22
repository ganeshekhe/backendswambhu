
const express = require("express");
const router = express.Router();
const { getFileByFilename } = require("../controllers/fileController");

router.get("/:filename", getFileByFilename);

module.exports = router;
