// ============================================
// src/modules/tenants/controllers/tenant.controller.js
// ============================================
const TenantServices = require("../services/tenant.services");

exports.createTenant = async (req, res) => {
  try {
    const data = req.body;
    const result = await TenantServices.createTenantService(data);
    res.status(201).json(result);
  } catch (error) {
    res.status(error.status || 400).json({
      error: error.message,
    });
  }
};

exports.getTenants = async (req, res) => {
  try {
    const tenants = await TenantServices.getTenantsService();
    res.status(200).json(tenants);
  } catch (error) {
    res.status(error.status || 500).json({
      error: error.message,
    });
  }
};

exports.getTenant = async (req, res) => {
  try {
    const { id } = req.params;
    const tenant = await TenantServices.getTenantService(id);
    res.status(200).json(tenant);
  } catch (error) {
    res.status(error.status || 404).json({
      error: error.message,
    });
  }
};

exports.getTenantProfile = async (req, res) => {
  try {
    // Get tenant profile for logged-in user
    const tenant = await TenantServices.getTenantByUserIdService(req.user.id);
    res.status(200).json(tenant);
  } catch (error) {
    res.status(error.status || 404).json({
      error: error.message,
    });
  }
};

exports.updateTenant = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const result = await TenantServices.updateTenantService(id, data);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 400).json({
      error: error.message,
    });
  }
};

exports.deleteTenant = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await TenantServices.deleteTenantService(id);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 400).json({
      error: error.message,
    });
  }
};

exports.getTenantLeases = async (req, res) => {
  try {
    const { id } = req.params;
    const leases = await TenantServices.getTenantLeasesService(id);
    res.status(200).json(leases);
  } catch (error) {
    res.status(error.status || 500).json({
      error: error.message,
    });
  }
};

exports.getTenantPayments = async (req, res) => {
  try {
    const { id } = req.params;
    const payments = await TenantServices.getTenantPaymentsService(id);
    res.status(200).json(payments);
  } catch (error) {
    res.status(error.status || 500).json({
      error: error.message,
    });
  }
};
