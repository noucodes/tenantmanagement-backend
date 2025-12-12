// ============================================
// src/modules/leases/services/lease.services.js
// ============================================
const LeaseModel = require("../models/lease.model");

class LeaseServices {
  async createLeaseService(data) {
    try {
      if (
        !data.tenant_id ||
        !data.unit_id ||
        !data.start_date ||
        !data.end_date ||
        !data.rent_amount
      ) {
        throw new Error(
          "Missing required fields: tenant_id, unit_id, start_date, end_date, rent_amount"
        );
      }

      const lease = await LeaseModel.create(data);
      return {
        message: "✅ Lease created successfully",
        lease,
      };
    } catch (err) {
      console.error("❌ Error in createLeaseService:", err.message);
      throw err;
    }
  }

  async getLeasesService(filters = {}) {
    try {
      if (filters.expiring === "true") {
        const days = parseInt(filters.days) || 30;
        return await LeaseModel.getExpiring(days);
      }
      return await LeaseModel.findAll();
    } catch (err) {
      console.error("❌ Error in getLeasesService:", err.message);
      throw err;
    }
  }

  async getLeaseService(id) {
    try {
      const lease = await LeaseModel.findById(id);

      if (!lease) {
        const error = new Error("Lease not found");
        error.status = 404;
        throw error;
      }

      return lease;
    } catch (err) {
      console.error("❌ Error in getLeaseService:", err.message);
      throw err;
    }
  }

  async getTenantActiveLeaseService(userId) {
    try {
      const lease = await LeaseModel.findActiveByUserId(userId);

      if (!lease) {
        const error = new Error("No active lease found");
        error.status = 404;
        throw error;
      }

      return lease;
    } catch (err) {
      console.error("❌ Error in getTenantActiveLeaseService:", err.message);
      throw err;
    }
  }

  async updateLeaseService(id, data) {
    try {
      const lease = await LeaseModel.update(id, data);

      if (!lease) {
        const error = new Error("Lease not found");
        error.status = 404;
        throw error;
      }

      return {
        message: "✅ Lease updated successfully",
        lease,
      };
    } catch (err) {
      console.error("❌ Error in updateLeaseService:", err.message);
      throw err;
    }
  }

  async terminateLeaseService(id) {
    try {
      const lease = await LeaseModel.terminate(id);

      if (!lease) {
        const error = new Error("Lease not found");
        error.status = 404;
        throw error;
      }

      return {
        message: "✅ Lease terminated successfully",
        lease,
      };
    } catch (err) {
      console.error("❌ Error in terminateLeaseService:", err.message);
      throw err;
    }
  }

  async deleteLeaseService(id) {
    try {
      const lease = await LeaseModel.delete(id);

      if (!lease) {
        const error = new Error("Lease not found");
        error.status = 404;
        throw error;
      }

      return { message: "✅ Lease deleted successfully" };
    } catch (err) {
      console.error("❌ Error in deleteLeaseService:", err.message);
      throw err;
    }
  }

  async getLeasePaymentsService(leaseId) {
    try {
      const payments = await LeaseModel.getPayments(leaseId);
      return payments;
    } catch (err) {
      console.error("❌ Error in getLeasePaymentsService:", err.message);
      throw err;
    }
  }
}

module.exports = new LeaseServices();
