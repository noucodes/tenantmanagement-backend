// ============================================
// src/modules/reports/controllers/report.controller.js
// ============================================
const ReportServices = require("../services/report.services");

exports.getOccupancyReport = async (req, res) => {
  try {
    const report = await ReportServices.getOccupancyReportService();
    res.status(200).json(report);
  } catch (error) {
    res.status(error.status || 500).json({
      error: error.message,
    });
  }
};

exports.getRevenueReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const report = await ReportServices.getRevenueReportService(
      startDate,
      endDate
    );
    res.status(200).json(report);
  } catch (error) {
    res.status(error.status || 400).json({
      error: error.message,
    });
  }
};

exports.getMonthlyRevenue = async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    const report = await ReportServices.getMonthlyRevenueService(year);
    res.status(200).json(report);
  } catch (error) {
    res.status(error.status || 500).json({
      error: error.message,
    });
  }
};

exports.getPropertyPerformance = async (req, res) => {
  try {
    const report = await ReportServices.getPropertyPerformanceService();
    res.status(200).json(report);
  } catch (error) {
    res.status(error.status || 500).json({
      error: error.message,
    });
  }
};

exports.getTenantReport = async (req, res) => {
  try {
    const report = await ReportServices.getTenantReportService();
    res.status(200).json(report);
  } catch (error) {
    res.status(error.status || 500).json({
      error: error.message,
    });
  }
};

exports.getLeaseExpirations = async (req, res) => {
  try {
    const days = req.query.days || 90;
    const report = await ReportServices.getLeaseExpirationsService(days);
    res.status(200).json(report);
  } catch (error) {
    res.status(error.status || 500).json({
      error: error.message,
    });
  }
};

exports.getPaymentTrends = async (req, res) => {
  try {
    const months = req.query.months || 6;
    const report = await ReportServices.getPaymentTrendsService(months);
    res.status(200).json(report);
  } catch (error) {
    res.status(error.status || 500).json({
      error: error.message,
    });
  }
};
