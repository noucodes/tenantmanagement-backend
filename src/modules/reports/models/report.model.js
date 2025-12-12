// ============================================
// src/modules/reports/models/report.model.js
// ============================================
const pool = require("../../../config/db");

class ReportModel {
  // Get occupancy report
  async getOccupancyReport() {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_units,
        COUNT(CASE WHEN status = 'occupied' THEN 1 END) as occupied_units,
        COUNT(CASE WHEN status = 'vacant' THEN 1 END) as vacant_units,
        ROUND(
          COUNT(CASE WHEN status = 'occupied' THEN 1 END)::NUMERIC / 
          NULLIF(COUNT(*), 0) * 100, 
          2
        ) as occupancy_rate
      FROM units
    `);
    return result.rows[0];
  }

  // Get revenue report for date range
  async getRevenueReport(startDate, endDate) {
    const result = await pool.query(
      `SELECT 
        COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN status IN ('pending', 'late') THEN amount ELSE 0 END), 0) as pending_revenue,
        COALESCE(SUM(late_fee), 0) as total_late_fees,
        COUNT(*) as total_transactions,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_transactions,
        COUNT(CASE WHEN status = 'late' THEN 1 END) as late_transactions
      FROM payments
      WHERE payment_date BETWEEN $1 AND $2`,
      [startDate, endDate]
    );
    return result.rows[0];
  }

  // Get monthly revenue breakdown
  async getMonthlyRevenue(year) {
    const result = await pool.query(
      `SELECT 
        EXTRACT(MONTH FROM payment_date) as month,
        TO_CHAR(payment_date, 'Month') as month_name,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as revenue,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as transaction_count
      FROM payments
      WHERE EXTRACT(YEAR FROM payment_date) = $1
      GROUP BY EXTRACT(MONTH FROM payment_date), TO_CHAR(payment_date, 'Month')
      ORDER BY EXTRACT(MONTH FROM payment_date)`,
      [year]
    );
    return result.rows;
  }

  // Get property performance report
  async getPropertyPerformance() {
    const result = await pool.query(`
      SELECT 
        p.id,
        p.name,
        p.address,
        p.city,
        p.state,
        COUNT(DISTINCT u.id) as total_units,
        COUNT(DISTINCT CASE WHEN u.status = 'occupied' THEN u.id END) as occupied_units,
        ROUND(
          COUNT(DISTINCT CASE WHEN u.status = 'occupied' THEN u.id END)::NUMERIC / 
          NULLIF(COUNT(DISTINCT u.id), 0) * 100, 
          2
        ) as occupancy_rate,
        COALESCE(SUM(u.rent_amount), 0) as potential_revenue,
        COALESCE(SUM(CASE WHEN l.status = 'active' THEN l.rent_amount ELSE 0 END), 0) as actual_revenue
      FROM properties p
      LEFT JOIN units u ON p.id = u.property_id
      LEFT JOIN leases l ON u.id = l.unit_id
      GROUP BY p.id, p.name, p.address, p.city, p.state
      ORDER BY p.name
    `);
    return result.rows;
  }

  // Get tenant report
  async getTenantReport() {
    const result = await pool.query(`
      SELECT 
        COUNT(DISTINCT t.id) as total_tenants,
        COUNT(DISTINCT CASE WHEN t.status = 'active' THEN t.id END) as active_tenants,
        COUNT(DISTINCT CASE WHEN l.status = 'active' THEN t.id END) as tenants_with_lease,
        COUNT(DISTINCT CASE WHEN p.status = 'late' THEN t.id END) as tenants_with_late_payments
      FROM tenants t
      LEFT JOIN leases l ON t.id = l.tenant_id
      LEFT JOIN payments p ON l.id = p.lease_id
    `);
    return result.rows[0];
  }

  // Get lease expirations
  async getLeaseExpirations(days = 90) {
    const result = await pool.query(
      `SELECT 
        l.id,
        l.start_date,
        l.end_date,
        l.rent_amount,
        CONCAT(u.first_name, ' ', u.last_name) as tenant_name,
        u.email as tenant_email,
        t.phone as tenant_phone,
        un.unit_number,
        p.name as property_name,
        p.address as property_address,
        l.end_date - CURRENT_DATE as days_until_expiry
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

  // Get payment trends
  async getPaymentTrends(months = 6) {
    const result = await pool.query(
      `SELECT 
        TO_CHAR(payment_date, 'YYYY-MM') as month,
        COUNT(*) as total_payments,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'late' THEN 1 END) as late,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as revenue
      FROM payments
      WHERE payment_date >= CURRENT_DATE - INTERVAL '${months} months'
      GROUP BY TO_CHAR(payment_date, 'YYYY-MM')
      ORDER BY month DESC`
    );
    return result.rows;
  }
}

module.exports = new ReportModel();
