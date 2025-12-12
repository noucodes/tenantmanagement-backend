// ============================================
// src/modules/properties/services/property.services.js
// ============================================
const PropertyModel = require("../models/property.model");

class PropertyServices {
  async createPropertyService(data) {
    try {
      // Validate required fields
      if (!data.name || !data.address || !data.city || !data.state) {
        throw new Error("Missing required fields: name, address, city, state");
      }

      const property = await PropertyModel.create(data);
      return {
        message: "✅ Property created successfully",
        property,
      };
    } catch (err) {
      console.error("❌ Error in createPropertyService:", err.message);
      throw err;
    }
  }

  async getPropertiesService() {
    try {
      const properties = await PropertyModel.findAll();
      return properties;
    } catch (err) {
      console.error("❌ Error in getPropertiesService:", err.message);
      throw err;
    }
  }

  async getPropertyService(id) {
    try {
      const property = await PropertyModel.findById(id);

      if (!property) {
        const error = new Error("Property not found");
        error.status = 404;
        throw error;
      }

      return property;
    } catch (err) {
      console.error("❌ Error in getPropertyService:", err.message);
      throw err;
    }
  }

  async updatePropertyService(id, data) {
    try {
      const property = await PropertyModel.update(id, data);

      if (!property) {
        const error = new Error("Property not found");
        error.status = 404;
        throw error;
      }

      return {
        message: "✅ Property updated successfully",
        property,
      };
    } catch (err) {
      console.error("❌ Error in updatePropertyService:", err.message);
      throw err;
    }
  }

  async deletePropertyService(id) {
    try {
      const property = await PropertyModel.delete(id);

      if (!property) {
        const error = new Error("Property not found");
        error.status = 404;
        throw error;
      }

      return { message: "✅ Property deleted successfully" };
    } catch (err) {
      console.error("❌ Error in deletePropertyService:", err.message);
      throw err;
    }
  }

  async getPropertyUnitsService(propertyId) {
    try {
      const units = await PropertyModel.getUnits(propertyId);
      return units;
    } catch (err) {
      console.error("❌ Error in getPropertyUnitsService:", err.message);
      throw err;
    }
  }
}

module.exports = new PropertyServices();
