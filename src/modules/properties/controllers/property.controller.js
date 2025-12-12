// ============================================
// src/modules/properties/controllers/property.controller.js
// ============================================
const PropertyServices = require("../services/property.services");

exports.createProperty = async (req, res) => {
  try {
    const data = req.body;
    const result = await PropertyServices.createPropertyService(data);
    res.status(201).json(result);
  } catch (error) {
    res.status(error.status || 400).json({
      error: error.message,
    });
  }
};

exports.getProperties = async (req, res) => {
  try {
    const properties = await PropertyServices.getPropertiesService();
    res.status(200).json(properties);
  } catch (error) {
    res.status(error.status || 500).json({
      error: error.message,
    });
  }
};

exports.getProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await PropertyServices.getPropertyService(id);
    res.status(200).json(property);
  } catch (error) {
    res.status(error.status || 404).json({
      error: error.message,
    });
  }
};

exports.updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const result = await PropertyServices.updatePropertyService(id, data);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 400).json({
      error: error.message,
    });
  }
};

exports.deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await PropertyServices.deletePropertyService(id);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 400).json({
      error: error.message,
    });
  }
};

exports.getPropertyUnits = async (req, res) => {
  try {
    const { id } = req.params;
    const units = await PropertyServices.getPropertyUnitsService(id);
    res.status(200).json(units);
  } catch (error) {
    res.status(error.status || 500).json({
      error: error.message,
    });
  }
};
