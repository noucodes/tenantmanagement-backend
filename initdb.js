// initdb.js
const pool = require("./src/config/db");

async function createTables() {
  try {
    console.log("🚀 Creating database tables...");

    // Enable pgcrypto for gen_random_uuid()
    await pool.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'tenant',
        employee_id VARCHAR(50) UNIQUE,
        login_attempts INT DEFAULT 0,
        locked_until TIMESTAMP,
        suspended BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tenants table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tenants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        phone VARCHAR(20),
        emergency_contact_name VARCHAR(200),
        emergency_contact_phone VARCHAR(20),
        date_of_birth DATE,
        identification_number VARCHAR(100),
        occupation VARCHAR(100),
        employer VARCHAR(200),
        monthly_income DECIMAL(10,2),
        status VARCHAR(50) DEFAULT 'active',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Properties table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS properties (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        address VARCHAR(500) NOT NULL,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        zip_code VARCHAR(20),
        property_type VARCHAR(100),
        total_units INT DEFAULT 0,
        description TEXT,
        amenities TEXT,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Units table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS units (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
        unit_number VARCHAR(50) NOT NULL,
        floor INT,
        bedrooms INT,
        bathrooms DECIMAL(3,1),
        square_feet DECIMAL(10,2),
        rent_amount DECIMAL(10,2) NOT NULL,
        security_deposit DECIMAL(10,2),
        status VARCHAR(50) DEFAULT 'vacant',
        description TEXT,
        amenities TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(property_id, unit_number)
      );
    `);

    // Leases table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS leases (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        unit_id UUID REFERENCES units(id) ON DELETE CASCADE,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        rent_amount DECIMAL(10,2) NOT NULL,
        security_deposit DECIMAL(10,2),
        payment_day INT DEFAULT 1,
        status VARCHAR(50) DEFAULT 'active',
        terms TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Payments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        lease_id UUID REFERENCES leases(id) ON DELETE CASCADE,
        amount DECIMAL(10,2) NOT NULL,
        payment_date DATE NOT NULL,
        due_date DATE NOT NULL,
        payment_method VARCHAR(50),
        transaction_id VARCHAR(255),
        status VARCHAR(50) DEFAULT 'pending',
        late_fee DECIMAL(10,2) DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✅ All tables created successfully!");
  } catch (error) {
    console.error("❌ Error creating tables:", error);
    throw error;
  }
}

module.exports = { createTables };
