// ============================================
// src/modules/properties/models/property.model.js
// ============================================
const pool = require("../../../config/db");

class PropertyModel {
  // Create property
  async create(data) {
    const {
      name,
      address,
      city,
      state,
      zip_code,
      property_type,
      total_units,
      description,
      amenities,
      status = "active",
    } = data;

    const result = await pool.query(
      `INSERT INTO properties 
       (name, address, city, state, zip_code, property_type, total_units, description, amenities, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING *`,
      [
        name,
        address,
        city,
        state,
        zip_code,
        property_type,
        total_units || 0,
        description,
        amenities,
        status,
      ]
    );

    return result.rows[0];
  }

  // Get all properties with unit statistics
  async findAll() {
    const result = await pool.query(`
      SELECT 
        p.*,
        COUNT(DISTINCT u.id) as total_units_count,
        COUNT(DISTINCT CASE WHEN u.status = 'occupied' THEN u.id END) as occupied_units,
        COUNT(DISTINCT CASE WHEN u.status = 'vacant' THEN u.id END) as vacant_units,
        COALESCE(SUM(CASE WHEN l.status = 'active' THEN l.rent_amount ELSE 0 END), 0) as monthly_revenue
      FROM properties p
      LEFT JOIN units u ON p.id = u.property_id
      LEFT JOIN leases l ON u.id = l.unit_id AND l.status = 'active'
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);

    return result.rows;
  }

  // Get property by ID with detailed stats
  async findById(id) {
    const result = await pool.query(
      `SELECT 
        p.*,
        COUNT(DISTINCT u.id) as total_units_count,
        COUNT(DISTINCT CASE WHEN u.status = 'occupied' THEN u.id END) as occupied_units,
        COUNT(DISTINCT CASE WHEN u.status = 'vacant' THEN u.id END) as vacant_units,
        COALESCE(SUM(CASE WHEN l.status = 'active' THEN l.rent_amount ELSE 0 END), 0) as monthly_revenue,
        ROUND(
          COUNT(DISTINCT CASE WHEN u.status = 'occupied' THEN u.id END)::NUMERIC / 
          NULLIF(COUNT(DISTINCT u.id), 0) * 100, 
          2
        ) as occupancy_rate
      FROM properties p
      LEFT JOIN units u ON p.id = u.property_id
      LEFT JOIN leases l ON u.id = l.unit_id AND l.status = 'active'
      WHERE p.id = $1
      GROUP BY p.id`,
      [id]
    );

    return result.rows[0];
  }

  // Update property
  async update(id, data) {
    const {
      name,
      address,
      city,
      state,
      zip_code,
      property_type,
      total_units,
      description,
      amenities,
      status,
    } = data;

    const result = await pool.query(
      `UPDATE properties 
       SET name = $1, address = $2, city = $3, state = $4, 
           zip_code = $5, property_type = $6, total_units = $7,
           description = $8, amenities = $9, status = $10,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $11 
       RETURNING *`,
      [
        name,
        address,
        city,
        state,
        zip_code,
        property_type,
        total_units,
        description,
        amenities,
        status,
        id,
      ]
    );

    return result.rows[0];
  }

  // Delete property
  async delete(id) {
    const result = await pool.query(
      "DELETE FROM properties WHERE id = $1 RETURNING *",
      [id]
    );
    return result.rows[0];
  }

  // Get units for a property
  async getUnits(propertyId) {
    const result = await pool.query(
      `SELECT 
        u.*,
        l.id as lease_id,
        l.status as lease_status,
        l.start_date,
        l.end_date,
        l.rent_amount as current_rent,
        t.id as tenant_id,
        CONCAT(us.first_name, ' ', us.last_name) as tenant_name,
        us.email as tenant_email
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
}

module.exports = new PropertyModel();
