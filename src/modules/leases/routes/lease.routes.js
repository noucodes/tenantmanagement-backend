// ============================================
// src/modules/leases/routes/leases.routes.js
// ============================================
const express = require("express");
const router = express.Router();
const leaseController = require("../controllers/lease.controller");

router.post("/", leaseController.createLease);
router.get("/", leaseController.getLeases);
router.get("/my-lease", leaseController.getTenantActiveLease);
router.get("/:id", leaseController.getLease);
router.put("/:id", leaseController.updateLease);
router.post("/:id/terminate", leaseController.terminateLease);
router.delete("/:id", leaseController.deleteLease);
router.get("/:id/payments", leaseController.getLeasePayments);

module.exports = router;
