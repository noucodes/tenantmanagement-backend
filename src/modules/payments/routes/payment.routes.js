// ============================================
// src/modules/payments/routes/payments.routes.js
// ============================================
const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");

router.post("/", paymentController.createPayment);
router.get("/", paymentController.getPayments);
router.get("/stats", paymentController.getPaymentStats);
router.get("/stats/monthly", paymentController.getMonthlyStats);
router.get("/my-payments", paymentController.getTenantPayments);
router.get("/:id", paymentController.getPayment);
router.put("/:id", paymentController.updatePayment);
router.delete("/:id", paymentController.deletePayment);

module.exports = router;
