const mongoose = require("mongoose");

const feeSchema = new mongoose.Schema({
  caste: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Fee", feeSchema);
