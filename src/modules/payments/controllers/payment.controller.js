// ============================================
// src/modules/payments/controllers/payment.controller.js
// ============================================
const PaymentServices = require("../services/payment.services");

exports.createPayment = async (req, res) => {
  try {
    const data = req.body;
    const result = await PaymentServices.createPaymentService(data);
    res.status(201).json(result);
  } catch (error) {
    res.status(error.status || 400).json({
      error: error.message,
    });
  }
};

exports.getPayments = async (req, res) => {
  try {
    const filters = {
      overdue: req.query.overdue,
      pending: req.query.pending,
      lease_id: req.query.lease_id,
    };
    const payments = await PaymentServices.getPaymentsService(filters);
    res.status(200).json(payments);
  } catch (error) {
    res.status(error.status || 500).json({
      error: error.message,
    });
  }
};

exports.getPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await PaymentServices.getPaymentService(id);
    res.status(200).json(payment);
  } catch (error) {
    res.status(error.status || 404).json({
      error: error.message,
    });
  }
};

exports.getTenantPayments = async (req, res) => {
  try {
    const payments = await PaymentServices.getTenantPaymentsService(
      req.user.id
    );
    res.status(200).json(payments);
  } catch (error) {
    res.status(error.status || 500).json({
      error: error.message,
    });
  }
};

exports.updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const result = await PaymentServices.updatePaymentService(id, data);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 400).json({
      error: error.message,
    });
  }
};

exports.deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await PaymentServices.deletePaymentService(id);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 400).json({
      error: error.message,
    });
  }
};

exports.getPaymentStats = async (req, res) => {
  try {
    const stats = await PaymentServices.getPaymentStatsService();
    res.status(200).json(stats);
  } catch (error) {
    res.status(error.status || 500).json({
      error: error.message,
    });
  }
};

exports.getMonthlyStats = async (req, res) => {
  try {
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({
        error: "Year and month are required",
      });
    }

    const stats = await PaymentServices.getMonthlyStatsService(
      parseInt(year),
      parseInt(month)
    );
    res.status(200).json(stats);
  } catch (error) {
    res.status(error.status || 500).json({
      error: error.message,
    });
  }
};
