// ========================================================
// LEASES MODULE - COMPLETE
// ========================================================

// ============================================
// src/modules/leases/models/lease.model.js
// ============================================
const pool = require("../../../config/db");

class LeaseModel {
  async create(data) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const result = await client.query(
        `INSERT INTO leases 
         (tenant_id, unit_id, start_date, end_date, rent_amount,
          security_deposit, payment_day, status, terms, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
         RETURNING *`,
        [
          data.tenant_id,
          data.unit_id,
          data.start_date,
          data.end_date,
          data.rent_amount,
          data.security_deposit,
          data.payment_day || 1,
          data.status || "active",
          data.terms,
          data.notes,
        ]
      );

      await client.query("UPDATE units SET status = 'occupied' WHERE id = $1", [
        data.unit_id,
      ]);

      await client.query("COMMIT");
      return result.rows[0];
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  async findAll() {
    const result = await pool.query(`
      SELECT 
        l.*,
        t.id as tenant_id,
        CONCAT(u.first_name, ' ', u.last_name) as tenant_name,
        u.email as tenant_email,
        t.phone as tenant_phone,
        un.unit_number,
        un.bedrooms,
        un.bathrooms,
        p.id as property_id,
        p.name as property_name,
        p.address as property_address,
        p.city as property_city,
        p.state as property_state
      FROM leases l
      JOIN tenants t ON l.tenant_id = t.id
      JOIN users u ON t.user_id = u.id
      JOIN units un ON l.unit_id = un.id
      JOIN properties p ON un.property_id = p.id
      ORDER BY l.start_date DESC
    `);
    return result.rows;
  }

  async findById(id) {
    const result = await pool.query(
      `SELECT 
        l.*,
        t.id as tenant_id,
        CONCAT(u.first_name, ' ', u.last_name) as tenant_name,
        u.email as tenant_email,
        t.phone as tenant_phone,
        t.emergency_contact_name,
        t.emergency_contact_phone,
        un.unit_number,
        un.bedrooms,
        un.bathrooms,
        un.square_feet,
        p.id as property_id,
        p.name as property_name,
        p.address as property_address,
        p.city as property_city,
        p.state as property_state
      FROM leases l
      JOIN tenants t ON l.tenant_id = t.id
      JOIN users u ON t.user_id = u.id
      JOIN units un ON l.unit_id = un.id
      JOIN properties p ON un.property_id = p.id
      WHERE l.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  async findActiveByUserId(userId) {
    const result = await pool.query(
      `SELECT 
        l.*,
        un.unit_number,
        un.bedrooms,
        un.bathrooms,
        un.square_feet,
        p.name as property_name,
        p.address as property_address,
        p.city,
        p.state,
        p.zip_code
      FROM leases l
      JOIN tenants t ON l.tenant_id = t.id
      JOIN units un ON l.unit_id = un.id
      JOIN properties p ON un.property_id = p.id
      WHERE t.user_id = $1 AND l.status = 'active'`,
      [userId]
    );
    return result.rows[0];
  }

  async update(id, data) {
    const result = await pool.query(
      `UPDATE leases 
       SET tenant_id = $1, unit_id = $2, start_date = $3, end_date = $4,
           rent_amount = $5, security_deposit = $6, payment_day = $7,
           status = $8, terms = $9, notes = $10, 
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $11 
       RETURNING *`,
      [
        data.tenant_id,
        data.unit_id,
        data.start_date,
        data.end_date,
        data.rent_amount,
        data.security_deposit,
        data.payment_day,
        data.status,
        data.terms,
        data.notes,
        id,
      ]
    );
    return result.rows[0];
  }

  async terminate(id) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const leaseResult = await client.query(
        "SELECT unit_id FROM leases WHERE id = $1",
        [id]
      );

      if (leaseResult.rows.length === 0) {
        throw new Error("Lease not found");
      }

      const result = await client.query(
        `UPDATE leases 
         SET status = 'terminated', updated_at = CURRENT_TIMESTAMP
         WHERE id = $1 
         RETURNING *`,
        [id]
      );

      await client.query("UPDATE units SET status = 'vacant' WHERE id = $1", [
        leaseResult.rows[0].unit_id,
      ]);

      await client.query("COMMIT");
      return result.rows[0];
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  async delete(id) {
    const result = await pool.query(
      "DELETE FROM leases WHERE id = $1 RETURNING *",
      [id]
    );
    return result.rows[0];
  }

  async getPayments(leaseId) {
    const result = await pool.query(
      `SELECT * FROM payments 
       WHERE lease_id = $1 
       ORDER BY due_date DESC`,
      [leaseId]
    );
    return result.rows;
  }

  async getExpiring(days = 30) {
    const result = await pool.query(
      `SELECT 
        l.*,
        CONCAT(u.first_name, ' ', u.last_name) as tenant_name,
        u.email as tenant_email,
        t.phone as tenant_phone,
        un.unit_number,
        p.name as property_name,
        p.address as property_address
      FROM leases l
      JOIN tenants t ON l.tenant_id = t.id
      JOIN users u ON t.user_id = u.id
      JOIN units un ON l.unit_id = un.id
      JOIN properties p ON un.property_id = p.id
      WHERE l.status = 'active' 
      AND l.end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + $1
      ORDER BY l.end_date`,
      [days]
    );
    return result.rows;
  }
}

module.exports = new LeaseModel();
