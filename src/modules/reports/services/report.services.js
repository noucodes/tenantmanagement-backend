// ============================================
// src/modules/reports/services/report.services.js
// ============================================
const ReportModel = require("../models/report.model");

class ReportServices {
  async getOccupancyReportService() {
    try {
      const report = await ReportModel.getOccupancyReport();
      return report;
    } catch (err) {
      console.error("❌ Error in getOccupancyReportService:", err.message);
      throw err;
    }
  }

  async getRevenueReportService(startDate, endDate) {
    try {
      if (!startDate || !endDate) {
        throw new Error("Start date and end date are required");
      }
      const report = await ReportModel.getRevenueReport(startDate, endDate);
      return report;
    } catch (err) {
      console.error("❌ Error in getRevenueReportService:", err.message);
      throw err;
    }
  }

  async getMonthlyRevenueService(year) {
    try {
      const report = await ReportModel.getMonthlyRevenue(year);
      return report;
    } catch (err) {
      console.error("❌ Error in getMonthlyRevenueService:", err.message);
      throw err;
    }
  }

  async getPropertyPerformanceService() {
    try {
      const report = await ReportModel.getPropertyPerformance();
      return report;
    } catch (err) {
      console.error("❌ Error in getPropertyPerformanceService:", err.message);
      throw err;
    }
  }

  async getTenantReportService() {
    try {
      const report = await ReportModel.getTenantReport();
      return report;
    } catch (err) {
      console.error("❌ Error in getTenantReportService:", err.message);
      throw err;
    }
  }

  async getLeaseExpirationsService(days) {
    try {
      const report = await ReportModel.getLeaseExpirations(days);
      return report;
    } catch (err) {
      console.error("❌ Error in getLeaseExpirationsService:", err.message);
      throw err;
    }
  }

  async getPaymentTrendsService(months) {
    try {
      const report = await ReportModel.getPaymentTrends(months);
      return report;
    } catch (err) {
      console.error("❌ Error in getPaymentTrendsService:", err.message);
      throw err;
    }
  }
}

module.exports = new ReportServices();
