// ============================================
// src/modules/dashboard/services/dashboard.services.js
// ============================================
const pool = require("../../../config/db");

class DashboardServices {
  // Admin dashboard
  async getAdminDashboardService() {
    try {
      const [
        propertiesStats,
        unitsStats,
        tenantsStats,
        leasesStats,
        paymentsStats,
        recentPayments,
        expiringLeases,
        overduePayments,
      ] = await Promise.all([
        // Properties stats
        pool.query(
          "SELECT COUNT(*) as total FROM properties WHERE status = 'active'"
        ),

        // Units stats
        pool.query(`
          SELECT 
            COUNT(*) as total,
            COUNT(CASE WHEN status = 'occupied' THEN 1 END) as occupied,
            COUNT(CASE WHEN status = 'vacant' THEN 1 END) as vacant
          FROM units
        `),

        // Tenants stats
        pool.query(
          "SELECT COUNT(*) as total FROM tenants WHERE status = 'active'"
        ),

        // Leases stats
        pool.query(`
          SELECT 
            COUNT(*) as total,
            COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
            COUNT(CASE WHEN end_date < CURRENT_DATE THEN 1 END) as expired
          FROM leases
        `),

        // Payments stats (current month)
        pool.query(`
          SELECT 
            COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as collected,
            COALESCE(SUM(CASE WHEN status IN ('pending', 'late') THEN amount ELSE 0 END), 0) as outstanding,
            COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
            COUNT(CASE WHEN status IN ('pending', 'late') THEN 1 END) as outstanding_count
          FROM payments
          WHERE EXTRACT(MONTH FROM due_date) = EXTRACT(MONTH FROM CURRENT_DATE)
        `),

        // Recent payments
        pool.query(`
          SELECT p.*, 
            CONCAT(u.first_name, ' ', u.last_name) as tenant_name,
            un.unit_number,
            pr.name as property_name
          FROM payments p
          JOIN leases l ON p.lease_id = l.id
          JOIN tenants t ON l.tenant_id = t.id
          JOIN users u ON t.user_id = u.id
          JOIN units un ON l.unit_id = un.id
          JOIN properties pr ON un.property_id = pr.id
          ORDER BY p.payment_date DESC
          LIMIT 5
        `),

        // Expiring leases (next 30 days)
        pool.query(`
          SELECT l.*, 
            CONCAT(u.first_name, ' ', u.last_name) as tenant_name,
            un.unit_number,
            p.name as property_name
          FROM leases l
          JOIN tenants t ON l.tenant_id = t.id
          JOIN users u ON t.user_id = u.id
          JOIN units un ON l.unit_id = un.id
          JOIN properties p ON un.property_id = p.id
          WHERE l.status = 'active' 
          AND l.end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + 30
          ORDER BY l.end_date
          LIMIT 5
        `),

        // Overdue payments
        pool.query(`
          SELECT p.*,
            CONCAT(u.first_name, ' ', u.last_name) as tenant_name,
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
          LIMIT 5
        `),
      ]);

      return {
        properties: propertiesStats.rows[0],
        units: unitsStats.rows[0],
        tenants: tenantsStats.rows[0],
        leases: leasesStats.rows[0],
        payments: paymentsStats.rows[0],
        recentPayments: recentPayments.rows,
        expiringLeases: expiringLeases.rows,
        overduePayments: overduePayments.rows,
      };
    } catch (err) {
      console.error("❌ Error in getAdminDashboardService:", err.message);
      throw err;
    }
  }

  // Tenant dashboard
  async getTenantDashboardService(userId) {
    try {
      const [tenantInfo, activeLease, recentPayments, upcomingPayments] =
        await Promise.all([
          // Tenant info
          pool.query(
            `SELECT t.*, u.first_name, u.last_name, u.email
             FROM tenants t
             JOIN users u ON t.user_id = u.id
             WHERE t.user_id = $1`,
            [userId]
          ),

          // Active lease
          pool.query(
            `SELECT l.*, 
              un.unit_number, un.bedrooms, un.bathrooms, un.square_feet,
              p.name as property_name, p.address, p.city, p.state
             FROM leases l
             JOIN tenants t ON l.tenant_id = t.id
             JOIN units un ON l.unit_id = un.id
             JOIN properties p ON un.property_id = p.id
             WHERE t.user_id = $1 AND l.status = 'active'`,
            [userId]
          ),

          // Recent payments
          pool.query(
            `SELECT p.*
             FROM payments p
             JOIN leases l ON p.lease_id = l.id
             JOIN tenants t ON l.tenant_id = t.id
             WHERE t.user_id = $1
             ORDER BY p.payment_date DESC
             LIMIT 5`,
            [userId]
          ),

          // Upcoming payments
          pool.query(
            `SELECT p.*
             FROM payments p
             JOIN leases l ON p.lease_id = l.id
             JOIN tenants t ON l.tenant_id = t.id
             WHERE t.user_id = $1 
             AND p.status IN ('pending', 'late')
             ORDER BY p.due_date
             LIMIT 3`,
            [userId]
          ),
        ]);

      return {
        tenant: tenantInfo.rows[0],
        activeLease: activeLease.rows[0],
        recentPayments: recentPayments.rows,
        upcomingPayments: upcomingPayments.rows,
      };
    } catch (err) {
      console.error("❌ Error in getTenantDashboardService:", err.message);
      throw err;
    }
  }
}

module.exports = new DashboardServices();
