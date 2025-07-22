


// ✅ Updated Service Routes (routes/serviceRoutes.js)
const express = require("express");
const router = express.Router();
const Service = require("../models/Service");
const { verifyToken } = require("../middleware/authMiddleware");

// Get All Services (Public)
router.get("/", async (req, res) => {
  try {
    const services = await Service.find().sort({ name: 1 });
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch services" });
  }
});

// Add Service (Admin)
router.post("/", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied" });

  const { name, description, icon, isActive, fees } = req.body;
  const service = new Service({
    name: name.trim(),
    description: description?.trim() || "",
    icon: icon?.trim() || "",
    isActive: isActive !== undefined ? isActive : true,
    fees: fees || { SC: 0, ST: 0, OBC: 0, General: 0, Other: 0 },
  });

  try {
    await service.save();
    res.status(201).json({ message: "Service added successfully", service });
  } catch (err) {
    res.status(500).json({ message: "Failed to add service" });
  }
});

// Update Service (Admin)
router.put("/:id", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied" });

  const { name, description, icon, isActive, fees } = req.body;
  const updateData = {
    ...(name && { name: name.trim() }),
    ...(description && { description: description.trim() }),
    ...(icon && { icon: icon.trim() }),
    ...(isActive !== undefined && { isActive }),
    ...(fees && { fees }),
  };

  try {
    const updatedService = await Service.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updatedService) return res.status(404).json({ message: "Service not found" });
    res.json({ message: "Service updated", service: updatedService });
  } catch (err) {
    res.status(500).json({ message: "Failed to update service" });
  }
});

// Delete Service (Admin)
router.delete("/:id", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied" });

  try {
    const deleted = await Service.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Service not found" });
    res.json({ message: "Service deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete service" });
  }
});

module.exports = router;




