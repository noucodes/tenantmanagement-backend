// ============================================
// src/modules/tenants/models/tenant.model.js
// ============================================
const pool = require("../../../config/db");
const bcrypt = require("bcrypt");

class TenantModel {
  // Create tenant (with or without user account)
  async create(data) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      let userId = data.user_id;

      // If email and password provided, create user account
      if (!userId && data.email && data.password) {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const userResult = await client.query(
          `INSERT INTO users (first_name, last_name, email, password, role)
           VALUES ($1, $2, $3, $4, 'tenant') RETURNING id`,
          [data.first_name, data.last_name, data.email, hashedPassword]
        );
        userId = userResult.rows[0].id;
      }

      // Create tenant profile
      const result = await client.query(
        `INSERT INTO tenants 
         (user_id, phone, emergency_contact_name, emergency_contact_phone,
          date_of_birth, identification_number, occupation, employer, 
          monthly_income, status, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
         RETURNING *`,
        [
          userId,
          data.phone,
          data.emergency_contact_name,
          data.emergency_contact_phone,
          data.date_of_birth,
          data.identification_number,
          data.occupation,
          data.employer,
          data.monthly_income,
          data.status || "active",
          data.notes,
        ]
      );

      await client.query("COMMIT");
      return result.rows[0];
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  // Get all tenants with user and lease info
  async findAll() {
    const result = await pool.query(`
      SELECT 
        t.*,
        u.first_name,
        u.last_name,
        u.email,
        l.id as active_lease_id,
        l.unit_id,
        l.start_date as lease_start,
        l.end_date as lease_end,
        l.rent_amount as current_rent,
        un.unit_number,
        p.name as property_name,
        p.address as property_address
      FROM tenants t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN leases l ON t.id = l.tenant_id AND l.status = 'active'
      LEFT JOIN units un ON l.unit_id = un.id
      LEFT JOIN properties p ON un.property_id = p.id
      ORDER BY u.last_name, u.first_name
    `);
    return result.rows;
  }

  // Get tenant by ID
  async findById(id) {
    const result = await pool.query(
      `SELECT 
        t.*,
        u.first_name,
        u.last_name,
        u.email,
        u.created_at as user_created_at,
        l.id as active_lease_id,
        l.unit_id,
        l.start_date as lease_start,
        l.end_date as lease_end,
        l.rent_amount as current_rent,
        un.unit_number,
        p.id as property_id,
        p.name as property_name,
        p.address as property_address
      FROM tenants t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN leases l ON t.id = l.tenant_id AND l.status = 'active'
      LEFT JOIN units un ON l.unit_id = un.id
      LEFT JOIN properties p ON un.property_id = p.id
      WHERE t.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  // Get tenant by user ID (for logged-in tenant to view their profile)
  async findByUserId(userId) {
    const result = await pool.query(
      `SELECT 
        t.*,
        u.first_name,
        u.last_name,
        u.email,
        l.id as active_lease_id,
        l.unit_id,
        l.start_date as lease_start,
        l.end_date as lease_end,
        l.rent_amount as current_rent,
        un.unit_number,
        p.name as property_name,
        p.address as property_address
      FROM tenants t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN leases l ON t.id = l.tenant_id AND l.status = 'active'
      LEFT JOIN units un ON l.unit_id = un.id
      LEFT JOIN properties p ON un.property_id = p.id
      WHERE t.user_id = $1`,
      [userId]
    );
    return result.rows[0];
  }

  // Update tenant
  async update(id, data) {
    const result = await pool.query(
      `UPDATE tenants 
       SET phone = $1, emergency_contact_name = $2, 
           emergency_contact_phone = $3, date_of_birth = $4,
           identification_number = $5, occupation = $6, employer = $7,
           monthly_income = $8, status = $9, notes = $10,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $11 
       RETURNING *`,
      [
        data.phone,
        data.emergency_contact_name,
        data.emergency_contact_phone,
        data.date_of_birth,
        data.identification_number,
        data.occupation,
        data.employer,
        data.monthly_income,
        data.status,
        data.notes,
        id,
      ]
    );
    return result.rows[0];
  }

  // Delete tenant
  async delete(id) {
    const result = await pool.query(
      "DELETE FROM tenants WHERE id = $1 RETURNING *",
      [id]
    );
    return result.rows[0];
  }

  // Get tenant's leases
  async getLeases(tenantId) {
    const result = await pool.query(
      `SELECT 
        l.*,
        un.unit_number,
        p.name as property_name,
        p.address as property_address
      FROM leases l
      LEFT JOIN units un ON l.unit_id = un.id
      LEFT JOIN properties p ON un.property_id = p.id
      WHERE l.tenant_id = $1
      ORDER BY l.start_date DESC`,
      [tenantId]
    );
    return result.rows;
  }

  // Get tenant's payments
  async getPayments(tenantId) {
    const result = await pool.query(
      `SELECT 
        pay.*,
        l.rent_amount,
        un.unit_number,
        p.name as property_name
      FROM payments pay
      JOIN leases l ON pay.lease_id = l.id
      LEFT JOIN units un ON l.unit_id = un.id
      LEFT JOIN properties p ON un.property_id = p.id
      WHERE l.tenant_id = $1
      ORDER BY pay.due_date DESC`,
      [tenantId]
    );
    return result.rows;
  }
}

module.exports = new TenantModel();
