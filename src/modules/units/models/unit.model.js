// ============================================
// src/modules/units/models/unit.model.js
// ============================================
const pool = require("../../../config/db");

class UnitModel {
  // Create unit
  async create(data) {
    const {
      property_id,
      unit_number,
      floor,
      bedrooms,
      bathrooms,
      square_feet,
      rent_amount,
      security_deposit,
      status = "vacant",
      description,
      amenities,
    } = data;

    const result = await pool.query(
      `INSERT INTO units 
       (property_id, unit_number, floor, bedrooms, bathrooms, square_feet, 
        rent_amount, security_deposit, status, description, amenities)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
       RETURNING *`,
      [
        property_id,
        unit_number,
        floor,
        bedrooms,
        bathrooms,
        square_feet,
        rent_amount,
        security_deposit,
        status,
        description,
        amenities,
      ]
    );

    return result.rows[0];
  }

  // Get all units with property and tenant info
  async findAll() {
    const result = await pool.query(`
      SELECT 
        u.*,
        p.name as property_name,
        p.address as property_address,
        p.city as property_city,
        p.state as property_state,
        l.id as lease_id,
        l.status as lease_status,
        l.start_date,
        l.end_date,
        l.rent_amount as current_rent,
        t.id as tenant_id,
        CONCAT(us.first_name, ' ', us.last_name) as tenant_name,
        us.email as tenant_email,
        t.phone as tenant_phone
      FROM units u
      LEFT JOIN properties p ON u.property_id = p.id
      LEFT JOIN leases l ON u.id = l.unit_id AND l.status = 'active'
      LEFT JOIN tenants t ON l.tenant_id = t.id
      LEFT JOIN users us ON t.user_id = us.id
      ORDER BY p.name, u.unit_number
    `);

    return result.rows;
  }

  // Get unit by ID with full details
  async findById(id) {
    const result = await pool.query(
      `SELECT 
        u.*,
        p.id as property_id,
        p.name as property_name,
        p.address as property_address,
        p.city as property_city,
        p.state as property_state,
        p.zip_code as property_zip,
        l.id as lease_id,
        l.status as lease_status,
        l.start_date,
        l.end_date,
        l.rent_amount as current_rent,
        l.security_deposit as lease_deposit,
        t.id as tenant_id,
        CONCAT(us.first_name, ' ', us.last_name) as tenant_name,
        us.email as tenant_email,
        us.first_name as tenant_first_name,
        us.last_name as tenant_last_name,
        t.phone as tenant_phone,
        t.emergency_contact_name,
        t.emergency_contact_phone
      FROM units u
      LEFT JOIN properties p ON u.property_id = p.id
      LEFT JOIN leases l ON u.id = l.unit_id AND l.status = 'active'
      LEFT JOIN tenants t ON l.tenant_id = t.id
      LEFT JOIN users us ON t.user_id = us.id
      WHERE u.id = $1`,
      [id]
    );

    return result.rows[0];
  }

  // Update unit
  async update(id, data) {
    const {
      property_id,
      unit_number,
      floor,
      bedrooms,
      bathrooms,
      square_feet,
      rent_amount,
      security_deposit,
      status,
      description,
      amenities,
    } = data;

    const result = await pool.query(
      `UPDATE units 
       SET property_id = $1, unit_number = $2, floor = $3, 
           bedrooms = $4, bathrooms = $5, square_feet = $6,
           rent_amount = $7, security_deposit = $8, status = $9,
           description = $10, amenities = $11, 
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $12 
       RETURNING *`,
      [
        property_id,
        unit_number,
        floor,
        bedrooms,
        bathrooms,
        square_feet,
        rent_amount,
        security_deposit,
        status,
        description,
        amenities,
        id,
      ]
    );

    return result.rows[0];
  }

  // Delete unit
  async delete(id) {
    const result = await pool.query(
      "DELETE FROM units WHERE id = $1 RETURNING *",
      [id]
    );
    return result.rows[0];
  }

  // Get units by property
  async findByProperty(propertyId) {
    const result = await pool.query(
      `SELECT 
        u.*,
        l.id as lease_id,
        l.status as lease_status,
        t.id as tenant_id,
        CONCAT(us.first_name, ' ', us.last_name) as tenant_name
      FROM units u
      LEFT JOIN leases l ON u.id = l.unit_id AND l.status = 'active'
      LEFT JOIN tenants t ON l.tenant_id = t.id
      LEFT JOIN users us ON t.user_id = us.id
      WHERE u.property_id = $1
      ORDER BY u.unit_number`,
      [propertyId]
    );

    return result.rows;
  }

  // Get vacant units
  async findVacant() {
    const result = await pool.query(
      `SELECT 
        u.*,
        p.name as property_name,
        p.address as property_address,
        p.city as property_city,
        p.state as property_state
      FROM units u
      LEFT JOIN properties p ON u.property_id = p.id
      WHERE u.status = 'vacant'
      ORDER BY p.name, u.unit_number`
    );

    return result.rows;
  }

  // Get occupied units
  async findOccupied() {
    const result = await pool.query(
      `SELECT 
        u.*,
        p.name as property_name,
        l.id as lease_id,
        CONCAT(us.first_name, ' ', us.last_name) as tenant_name
      FROM units u
      LEFT JOIN properties p ON u.property_id = p.id
      LEFT JOIN leases l ON u.id = l.unit_id AND l.status = 'active'
      LEFT JOIN tenants t ON l.tenant_id = t.id
      LEFT JOIN users us ON t.user_id = us.id
      WHERE u.status = 'occupied'
      ORDER BY p.name, u.unit_number`
    );

    return result.rows;
  }
}

module.exports = new UnitModel();
