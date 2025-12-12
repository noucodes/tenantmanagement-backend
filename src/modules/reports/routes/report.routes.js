// ============================================
// src/modules/reports/routes/reports.routes.js
// ============================================
const express = require("express");
const router = express.Router();
const reportController = require("../controllers/report.controller");

// Occupancy report
router.get("/occupancy", reportController.getOccupancyReport);

// Revenue reports
router.get("/revenue", reportController.getRevenueReport);
router.get("/revenue/monthly", reportController.getMonthlyRevenue);

// Property performance
router.get("/property-performance", reportController.getPropertyPerformance);

// Tenant report
router.get("/tenants", reportController.getTenantReport);

// Lease expirations
router.get("/lease-expirations", reportController.getLeaseExpirations);

// Payment trends
router.get("/payment-trends", reportController.getPaymentTrends);

module.exports = router;
