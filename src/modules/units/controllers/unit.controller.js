// ============================================
// src/modules/units/controllers/unit.controller.js
// ============================================
const UnitServices = require("../services/unit.services");

exports.createUnit = async (req, res) => {
  try {
    const data = req.body;
    const result = await UnitServices.createUnitService(data);
    res.status(201).json(result);
  } catch (error) {
    res.status(error.status || 400).json({
      error: error.message,
    });
  }
};

exports.getUnits = async (req, res) => {
  try {
    const filters = {
      vacant: req.query.vacant,
      occupied: req.query.occupied,
      property_id: req.query.property_id,
    };

    const units = await UnitServices.getUnitsService(filters);
    res.status(200).json(units);
  } catch (error) {
    res.status(error.status || 500).json({
      error: error.message,
    });
  }
};

exports.getUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const unit = await UnitServices.getUnitService(id);
    res.status(200).json(unit);
  } catch (error) {
    res.status(error.status || 404).json({
      error: error.message,
    });
  }
};

exports.updateUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const result = await UnitServices.updateUnitService(id, data);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 400).json({
      error: error.message,
    });
  }
};

exports.deleteUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await UnitServices.deleteUnitService(id);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 400).json({
      error: error.message,
    });
  }
};
