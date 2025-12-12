// ============================================
// src/modules/payments/models/payment.model.js
// ============================================
const pool = require("../../../config/db");

class PaymentModel {
  async create(data) {
    const result = await pool.query(
      `INSERT INTO payments 
       (lease_id, amount, payment_date, due_date, payment_method,
        transaction_id, status, late_fee, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [
        data.lease_id,
        data.amount,
        data.payment_date || new Date(),
        data.due_date,
        data.payment_method,
        data.transaction_id,
        data.status || "pending",
        data.late_fee || 0,
        data.notes,
      ]
    );
    return result.rows[0];
  }

  async findAll() {
    const result = await pool.query(`
      SELECT 
        p.*,
        l.rent_amount,
        l.tenant_id,
        CONCAT(u.first_name, ' ', u.last_name) as tenant_name,
        u.email as tenant_email,
        t.phone as tenant_phone,
        un.unit_number,
        pr.name as property_name,
        pr.address as property_address
      FROM payments p
      JOIN leases l ON p.lease_id = l.id
      JOIN tenants t ON l.tenant_id = t.id
      JOIN users u ON t.user_id = u.id
      JOIN units un ON l.unit_id = un.id
      JOIN properties pr ON un.property_id = pr.id
      ORDER BY p.due_date DESC
    `);
    return result.rows;
  }

  async findById(id) {
    const result = await pool.query(
      `SELECT 
        p.*,
        l.rent_amount,
        l.tenant_id,
        l.unit_id,
        CONCAT(u.first_name, ' ', u.last_name) as tenant_name,
        u.email as tenant_email,
        t.phone as tenant_phone,
        un.unit_number,
        pr.name as property_name,
        pr.address as property_address
      FROM payments p
      JOIN leases l ON p.lease_id = l.id
      JOIN tenants t ON l.tenant_id = t.id
      JOIN users u ON t.user_id = u.id
      JOIN units un ON l.unit_id = un.id
      JOIN properties pr ON un.property_id = pr.id
      WHERE p.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  async findByLease(leaseId) {
    const result = await pool.query(
      `SELECT * FROM payments 
       WHERE lease_id = $1 
       ORDER BY due_date DESC`,
      [leaseId]
    );
    return result.rows;
  }

  async findByTenantUserId(userId) {
    const result = await pool.query(
      `SELECT 
        p.*,
        l.rent_amount,
        un.unit_number,
        pr.name as property_name
      FROM payments p
      JOIN leases l ON p.lease_id = l.id
      JOIN tenants t ON l.tenant_id = t.id
      JOIN units un ON l.unit_id = un.id
      JOIN properties pr ON un.property_id = pr.id
      WHERE t.user_id = $1
      ORDER BY p.due_date DESC`,
      [userId]
    );
    return result.rows;
  }

  async update(id, data) {
    const result = await pool.query(
      `UPDATE payments 
       SET amount = $1, payment_date = $2, due_date = $3, 
           payment_method = $4, transaction_id = $5, status = $6,
           late_fee = $7, notes = $8, updated_at = CURRENT_TIMESTAMP
       WHERE id = $9 
       RETURNING *`,
      [
        data.amount,
        data.payment_date,
        data.due_date,
        data.payment_method,
        data.transaction_id,
        data.status,
        data.late_fee,
        data.notes,
        id,
      ]
    );
    return result.rows[0];
  }

  async delete(id) {
    const result = await pool.query(
      "DELETE FROM payments WHERE id = $1 RETURNING *",
      [id]
    );
    return result.rows[0];
  }

  async findOverdue() {
    const result = await pool.query(`
      SELECT 
        p.*,
        l.rent_amount,
        l.tenant_id,
        CONCAT(u.first_name, ' ', u.last_name) as tenant_name,
        u.email as tenant_email,
        t.phone as tenant_phone,
        un.unit_number,
        pr.name as property_name
      FROM payments p
      JOIN leases l ON p.lease_id = l.id
      JOIN tenants t ON l.tenant_id = t.id
      JOIN users u ON t.user_id = u.id
      JOIN units un ON l.unit_id = un.id
      JOIN properties pr ON un.property_id = pr.id
      WHERE p.status IN ('pending', 'late') 
      AND p.due_date < CURRENT_DATE
      ORDER BY p.due_date
    `);
    return result.rows;
  }

  async findPending() {
    const result = await pool.query(`
      SELECT 
        p.*,
        l.rent_amount,
        CONCAT(u.first_name, ' ', u.last_name) as tenant_name,
        un.unit_number,
        pr.name as property_name
      FROM payments p
      JOIN leases l ON p.lease_id = l.id
      JOIN tenants t ON l.tenant_id = t.id
      JOIN users u ON t.user_id = u.id
      JOIN units un ON l.unit_id = un.id
      JOIN properties pr ON un.property_id = pr.id
      WHERE p.status = 'pending'
      ORDER BY p.due_date
    `);
    return result.rows;
  }

  async getStats() {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_payments,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
        COUNT(CASE WHEN status = 'late' THEN 1 END) as late_count,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as total_collected,
        COALESCE(SUM(CASE WHEN status IN ('pending', 'late') THEN amount ELSE 0 END), 0) as total_outstanding,
        COALESCE(SUM(late_fee), 0) as total_late_fees
      FROM payments
    `);
    return result.rows[0];
  }

  async getMonthlyStats(year, month) {
    const result = await pool.query(
      `SELECT 
        COUNT(*) as total_payments,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as total_collected,
        COALESCE(SUM(late_fee), 0) as total_late_fees
      FROM payments
      WHERE EXTRACT(YEAR FROM payment_date) = $1 
      AND EXTRACT(MONTH FROM payment_date) = $2`,
      [year, month]
    );
    return result.rows[0];
  }
}

module.exports = new PaymentModel();
