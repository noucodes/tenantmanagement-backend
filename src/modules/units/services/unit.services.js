// ============================================
// src/modules/units/services/unit.services.js
// ============================================
const UnitModel = require("../models/unit.model");

class UnitServices {
  async createUnitService(data) {
    try {
      // Validate required fields
      if (!data.property_id || !data.unit_number || !data.rent_amount) {
        throw new Error(
          "Missing required fields: property_id, unit_number, rent_amount"
        );
      }

      const unit = await UnitModel.create(data);
      return {
        message: "✅ Unit created successfully",
        unit,
      };
    } catch (err) {
      console.error("❌ Error in createUnitService:", err.message);
      throw err;
    }
  }

  async getUnitsService(filters = {}) {
    try {
      // Handle different filter options
      if (filters.vacant === "true") {
        return await UnitModel.findVacant();
      }

      if (filters.occupied === "true") {
        return await UnitModel.findOccupied();
      }

      if (filters.property_id) {
        return await UnitModel.findByProperty(filters.property_id);
      }

      return await UnitModel.findAll();
    } catch (err) {
      console.error("❌ Error in getUnitsService:", err.message);
      throw err;
    }
  }

  async getUnitService(id) {
    try {
      const unit = await UnitModel.findById(id);

      if (!unit) {
        const error = new Error("Unit not found");
        error.status = 404;
        throw error;
      }

      return unit;
    } catch (err) {
      console.error("❌ Error in getUnitService:", err.message);
      throw err;
    }
  }

  async updateUnitService(id, data) {
    try {
      const unit = await UnitModel.update(id, data);

      if (!unit) {
        const error = new Error("Unit not found");
        error.status = 404;
        throw error;
      }

      return {
        message: "✅ Unit updated successfully",
        unit,
      };
    } catch (err) {
      console.error("❌ Error in updateUnitService:", err.message);
      throw err;
    }
  }

  async deleteUnitService(id) {
    try {
      const unit = await UnitModel.delete(id);

      if (!unit) {
        const error = new Error("Unit not found");
        error.status = 404;
        throw error;
      }

      return { message: "✅ Unit deleted successfully" };
    } catch (err) {
      console.error("❌ Error in deleteUnitService:", err.message);
      throw err;
    }
  }
}

module.exports = new UnitServices();
