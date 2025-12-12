// ============================================
// src/modules/payments/services/payment.services.js
// ============================================
const PaymentModel = require("../models/payment.model");

class PaymentServices {
  async createPaymentService(data) {
    try {
      if (!data.lease_id || !data.amount || !data.due_date) {
        throw new Error("Missing required fields: lease_id, amount, due_date");
      }

      const payment = await PaymentModel.create(data);
      return {
        message: "✅ Payment created successfully",
        payment,
      };
    } catch (err) {
      console.error("❌ Error in createPaymentService:", err.message);
      throw err;
    }
  }

  async getPaymentsService(filters = {}) {
    try {
      if (filters.overdue === "true") {
        return await PaymentModel.findOverdue();
      }

      if (filters.pending === "true") {
        return await PaymentModel.findPending();
      }

      if (filters.lease_id) {
        return await PaymentModel.findByLease(filters.lease_id);
      }

      return await PaymentModel.findAll();
    } catch (err) {
      console.error("❌ Error in getPaymentsService:", err.message);
      throw err;
    }
  }

  async getPaymentService(id) {
    try {
      const payment = await PaymentModel.findById(id);

      if (!payment) {
        const error = new Error("Payment not found");
        error.status = 404;
        throw error;
      }

      return payment;
    } catch (err) {
      console.error("❌ Error in getPaymentService:", err.message);
      throw err;
    }
  }

  async getTenantPaymentsService(userId) {
    try {
      const payments = await PaymentModel.findByTenantUserId(userId);
      return payments;
    } catch (err) {
      console.error("❌ Error in getTenantPaymentsService:", err.message);
      throw err;
    }
  }

  async updatePaymentService(id, data) {
    try {
      const payment = await PaymentModel.update(id, data);

      if (!payment) {
        const error = new Error("Payment not found");
        error.status = 404;
        throw error;
      }

      return {
        message: "✅ Payment updated successfully",
        payment,
      };
    } catch (err) {
      console.error("❌ Error in updatePaymentService:", err.message);
      throw err;
    }
  }

  async deletePaymentService(id) {
    try {
      const payment = await PaymentModel.delete(id);

      if (!payment) {
        const error = new Error("Payment not found");
        error.status = 404;
        throw error;
      }

      return { message: "✅ Payment deleted successfully" };
    } catch (err) {
      console.error("❌ Error in deletePaymentService:", err.message);
      throw err;
    }
  }

  async getPaymentStatsService() {
    try {
      const stats = await PaymentModel.getStats();
      return stats;
    } catch (err) {
      console.error("❌ Error in getPaymentStatsService:", err.message);
      throw err;
    }
  }

  async getMonthlyStatsService(year, month) {
    try {
      const stats = await PaymentModel.getMonthlyStats(year, month);
      return stats;
    } catch (err) {
      console.error("❌ Error in getMonthlyStatsService:", err.message);
      throw err;
    }
  }
}

module.exports = new PaymentServices();
