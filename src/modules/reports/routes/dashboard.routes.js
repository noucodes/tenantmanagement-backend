// ============================================
// src/modules/dashboard/routes/dashboard.routes.js
// ============================================
const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboard.controller");

// Admin dashboard
router.get("/admin", dashboardController.getAdminDashboard);

// Tenant dashboard
router.get("/tenant", dashboardController.getTenantDashboard);

module.exports = router;
