// ============================================
// src/modules/tenants/routes/tenants.routes.js
// ============================================
const express = require("express");
const router = express.Router();
const tenantController = require("../controllers/tenant.controller");

// Create tenant
router.post("/", tenantController.createTenant);

// Get all tenants
router.get("/", tenantController.getTenants);

// Get logged-in tenant's profile
router.get("/profile", tenantController.getTenantProfile);

// Get single tenant
router.get("/:id", tenantController.getTenant);

// Update tenant
router.put("/:id", tenantController.updateTenant);

// Delete tenant
router.delete("/:id", tenantController.deleteTenant);

// Get tenant's leases
router.get("/:id/leases", tenantController.getTenantLeases);

// Get tenant's payments
router.get("/:id/payments", tenantController.getTenantPayments);

module.exports = router;
