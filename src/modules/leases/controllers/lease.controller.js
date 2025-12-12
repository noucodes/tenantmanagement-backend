// ============================================
// src/modules/leases/controllers/lease.controller.js
// ============================================
const LeaseServices = require("../services/lease.services");

exports.createLease = async (req, res) => {
  try {
    const data = req.body;
    const result = await LeaseServices.createLeaseService(data);
    res.status(201).json(result);
  } catch (error) {
    res.status(error.status || 400).json({
      error: error.message,
    });
  }
};

exports.getLeases = async (req, res) => {
  try {
    const filters = {
      expiring: req.query.expiring,
      days: req.query.days,
    };
    const leases = await LeaseServices.getLeasesService(filters);
    res.status(200).json(leases);
  } catch (error) {
    res.status(error.status || 500).json({
      error: error.message,
    });
  }
};

exports.getLease = async (req, res) => {
  try {
    const { id } = req.params;
    const lease = await LeaseServices.getLeaseService(id);
    res.status(200).json(lease);
  } catch (error) {
    res.status(error.status || 404).json({
      error: error.message,
    });
  }
};

exports.getTenantActiveLease = async (req, res) => {
  try {
    const lease = await LeaseServices.getTenantActiveLeaseService(req.user.id);
    res.status(200).json(lease);
  } catch (error) {
    res.status(error.status || 404).json({
      error: error.message,
    });
  }
};

exports.updateLease = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const result = await LeaseServices.updateLeaseService(id, data);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 400).json({
      error: error.message,
    });
  }
};

exports.terminateLease = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await LeaseServices.terminateLeaseService(id);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 400).json({
      error: error.message,
    });
  }
};

exports.deleteLease = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await LeaseServices.deleteLeaseService(id);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 400).json({
      error: error.message,
    });
  }
};

exports.getLeasePayments = async (req, res) => {
  try {
    const { id } = req.params;
    const payments = await LeaseServices.getLeasePaymentsService(id);
    res.status(200).json(payments);
  } catch (error) {
    res.status(error.status || 500).json({
      error: error.message,
    });
  }
};
