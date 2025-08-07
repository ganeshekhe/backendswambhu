
const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },       // Main notice title
    titleMr: { type: String },                     // Optional: Marathi version
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Optional: who created the notice
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notice", noticeSchema);
