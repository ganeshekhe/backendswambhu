


// ✅ Updated Service Model (models/Service.js)
const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    description: { type: String, default: "", trim: true },
    icon: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    fees: {
      SC: { type: Number, default: 0 },
      ST: { type: Number, default: 0 },
      OBC: { type: Number, default: 0 },
      General: { type: Number, default: 0 },
      Other: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Service", serviceSchema);