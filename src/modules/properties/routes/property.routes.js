// ============================================
// src/modules/properties/routes/properties.routes.js
// ============================================
const express = require("express");
const router = express.Router();
const propertyController = require("../controllers/property.controller");

// Create property
router.post("/", propertyController.createProperty);

// Get all properties
router.get("/", propertyController.getProperties);

// Get single property
router.get("/:id", propertyController.getProperty);

// Update property
router.put("/:id", propertyController.updateProperty);

// Delete property
router.delete("/:id", propertyController.deleteProperty);

// Get property units
router.get("/:id/units", propertyController.getPropertyUnits);

module.exports = router;
