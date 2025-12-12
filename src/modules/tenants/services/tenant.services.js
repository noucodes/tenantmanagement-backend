// ============================================
// src/modules/tenants/services/tenant.services.js
// ============================================
const TenantModel = require("../models/tenant.model");

class TenantServices {
  async createTenantService(data) {
    try {
      // Validate required fields
      if (data.email && !data.password) {
        throw new Error("Password is required when creating user account");
      }

      const tenant = await TenantModel.create(data);
      return {
        message: "✅ Tenant created successfully",
        tenant,
      };
    } catch (err) {
      console.error("❌ Error in createTenantService:", err.message);
      throw err;
    }
  }

  async getTenantsService() {
    try {
      const tenants = await TenantModel.findAll();
      return tenants;
    } catch (err) {
      console.error("❌ Error in getTenantsService:", err.message);
      throw err;
    }
  }

  async getTenantService(id) {
    try {
      const tenant = await TenantModel.findById(id);

      if (!tenant) {
        const error = new Error("Tenant not found");
        error.status = 404;
        throw error;
      }

      return tenant;
    } catch (err) {
      console.error("❌ Error in getTenantService:", err.message);
      throw err;
    }
  }

  async getTenantByUserIdService(userId) {
    try {
      const tenant = await TenantModel.findByUserId(userId);

      if (!tenant) {
        const error = new Error("Tenant profile not found");
        error.status = 404;
        throw error;
      }

      return tenant;
    } catch (err) {
      console.error("❌ Error in getTenantByUserIdService:", err.message);
      throw err;
    }
  }

  async updateTenantService(id, data) {
    try {
      const tenant = await TenantModel.update(id, data);

      if (!tenant) {
        const error = new Error("Tenant not found");
        error.status = 404;
        throw error;
      }

      return {
        message: "✅ Tenant updated successfully",
        tenant,
      };
    } catch (err) {
      console.error("❌ Error in updateTenantService:", err.message);
      throw err;
    }
  }

  async deleteTenantService(id) {
    try {
      const tenant = await TenantModel.delete(id);

      if (!tenant) {
        const error = new Error("Tenant not found");
        error.status = 404;
        throw error;
      }

      return { message: "✅ Tenant deleted successfully" };
    } catch (err) {
      console.error("❌ Error in deleteTenantService:", err.message);
      throw err;
    }
  }

  async getTenantLeasesService(tenantId) {
    try {
      const leases = await TenantModel.getLeases(tenantId);
      return leases;
    } catch (err) {
      console.error("❌ Error in getTenantLeasesService:", err.message);
      throw err;
    }
  }

  async getTenantPaymentsService(tenantId) {
    try {
      const payments = await TenantModel.getPayments(tenantId);
      return payments;
    } catch (err) {
      console.error("❌ Error in getTenantPaymentsService:", err.message);
      throw err;
    }
  }
}

module.exports = new TenantServices();
