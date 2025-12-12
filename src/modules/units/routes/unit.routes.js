// ============================================
// src/modules/units/routes/units.routes.js
// ============================================
const express = require("express");
const router = express.Router();
const unitController = require("../controllers/unit.controller");

// Create unit
router.post("/", unitController.createUnit);

// Get all units (with optional filters: vacant, occupied, property_id)
router.get("/", unitController.getUnits);

// Get single unit
router.get("/:id", unitController.getUnit);

// Update unit
router.put("/:id", unitController.updateUnit);

// Delete unit
router.delete("/:id", unitController.deleteUnit);

module.exports = router;
