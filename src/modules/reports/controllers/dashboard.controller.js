// ============================================
// src/modules/dashboard/controllers/dashboard.controller.js
// ============================================
const DashboardServices = require("../services/dashboard.services");

exports.getAdminDashboard = async (req, res) => {
  try {
    const dashboard = await DashboardServices.getAdminDashboardService();
    res.status(200).json(dashboard);
  } catch (error) {
    res.status(error.status || 500).json({
      error: error.message,
    });
  }
};

exports.getTenantDashboard = async (req, res) => {
  try {
    const dashboard = await DashboardServices.getTenantDashboardService(
      req.user.id
    );
    res.status(200).json(dashboard);
  } catch (error) {
    res.status(error.status || 500).json({
      error: error.message,
    });
  }
};
