// src/routes/index.js
const express = require("express");
const router = express.Router();

// Import routes
const userRoutes = require("../modules/users/routes/user.routes");
const propertyRoutes = require("../modules/properties/routes/property.routes");
const unitRoutes = require("../modules/units/routes/unit.routes");
const tenantRoutes = require("../modules/tenants/routes/tenant.routes");
const leaseRoutes = require("../modules/leases/routes/lease.routes");
const paymentRoutes = require("../modules/payments/routes/payment.routes");
const reportRoutes = require("../modules/reports/routes/report.routes");
const dashboardRoutes = require("../modules/reports/routes/dashboard.routes");

// Import middleware
const authMiddleware = require("../middlewares/auth");
const logger = require("../middlewares/logging");

router.use(logger);

// ============================================
// Public Routes (No Authentication Required)
// ============================================
router.use("/users", userRoutes);

// Health check
router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Tenant Management API is running",
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// Protected Routes (Authentication Required)
// ============================================

// Get current user info
router.get("/me", authMiddleware, (req, res) => {
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
  });
});

// Properties routes
router.use("/properties", authMiddleware, propertyRoutes);

// Units routes
router.use("/units", authMiddleware, unitRoutes);

// Tenants routes
router.use("/tenants", authMiddleware, tenantRoutes);

// Leases routes
router.use("/leases", authMiddleware, leaseRoutes);

// Payments routes
router.use("/payments", authMiddleware, paymentRoutes);

// Reports routes
router.use("/reports", authMiddleware, reportRoutes);

// Dashboard routes
router.use("/dashboard", authMiddleware, dashboardRoutes);

module.exports = router;
