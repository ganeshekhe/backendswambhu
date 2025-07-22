
const mongoose = require("mongoose");

const heroSlideSchema = new mongoose.Schema({
  title: String,
  subtitle: String,
  image: {
    filename: String,
    fileId: mongoose.Schema.Types.ObjectId,
    uploadedAt: { type: Date, default: Date.now },
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("HeroSlide", heroSlideSchema);
