// scripts/seed.js
const pool = require("./src/config/db"); // Adjust path to your db config
const bcrypt = require("bcrypt");

const SALT_ROUNDS = 10;

async function seed() {
  const client = await pool.connect();

  try {
    console.log("🌱 Starting Database Seed...");
    await client.query("BEGIN");

    // =============================================
    // 1. CLEANUP (Truncate all tables)
    // =============================================
    console.log("🧹 Clearing existing data...");
    await client.query(`
      TRUNCATE TABLE payments, leases, tenants, units, properties, users RESTART IDENTITY CASCADE;
    `);

    // =============================================
    // 2. CREATE ADMIN USER
    // =============================================
    console.log("👤 Creating Admin...");
    const adminHash = await bcrypt.hash("admin123", SALT_ROUNDS);
    await client.query(
      `
      INSERT INTO users (first_name, last_name, email, password, role)
      VALUES ('System', 'Admin', 'admin@example.com', $1, 'admin')
    `,
      [adminHash]
    );

    // =============================================
    // 3. CREATE PROPERTIES
    // =============================================
    console.log("bldgs Creating Properties...");
    const props = await client.query(`
      INSERT INTO properties (name, address, city, state, zip_code, property_type)
      VALUES 
        ('Sunset Apartments', '123 Sunset Blvd', 'Los Angeles', 'CA', '90028', 'Residential'),
        ('Oak Ridge Complex', '456 Oak Ridge Dr', 'Austin', 'TX', '78701', 'Residential'),
        ('Downtown Lofts', '789 Main St', 'New York', 'NY', '10001', 'Commercial')
      RETURNING id, name;
    `);

    const propMap = {};
    props.rows.forEach((p) => (propMap[p.name] = p.id));

    // =============================================
    // 4. CREATE UNITS
    // =============================================
    console.log("🚪 Creating Units...");
    const unitsData = [
      // Sunset Apartments
      {
        p: "Sunset Apartments",
        num: "101",
        beds: 1,
        baths: 1,
        sqft: 650,
        rent: 1200,
      },
      {
        p: "Sunset Apartments",
        num: "102",
        beds: 1,
        baths: 1,
        sqft: 650,
        rent: 1200,
      }, // Vacant
      {
        p: "Sunset Apartments",
        num: "201",
        beds: 2,
        baths: 2,
        sqft: 950,
        rent: 1800,
      },
      // Oak Ridge
      {
        p: "Oak Ridge Complex",
        num: "1A",
        beds: 2,
        baths: 1,
        sqft: 850,
        rent: 1450,
      },
      {
        p: "Oak Ridge Complex",
        num: "1B",
        beds: 2,
        baths: 2,
        sqft: 1000,
        rent: 1600,
      },
      // Downtown Lofts
      {
        p: "Downtown Lofts",
        num: "3C",
        beds: 1,
        baths: 1,
        sqft: 1200,
        rent: 2500,
      },
      {
        p: "Downtown Lofts",
        num: "4A",
        beds: 3,
        baths: 2,
        sqft: 1800,
        rent: 3200,
      }, // Vacant
    ];

    const insertedUnits = [];
    for (const u of unitsData) {
      const res = await client.query(
        `
        INSERT INTO units (property_id, unit_number, floor, bedrooms, bathrooms, square_feet, rent_amount, status)
        VALUES ($1, $2, 1, $3, $4, $5, $6, 'vacant')
        RETURNING *
      `,
        [propMap[u.p], u.num, u.beds, u.baths, u.sqft, u.rent]
      );
      insertedUnits.push(res.rows[0]);
    }

    // Helper to find unit ID by number
    const getUnitId = (num) =>
      insertedUnits.find((u) => u.unit_number === num).id;

    // =============================================
    // 5. CREATE TENANTS (Users + Profiles)
    // =============================================
    console.log("👥 Creating Tenants...");

    const tenantsData = [
      {
        first: "Sarah",
        last: "Johnson",
        email: "sarah@test.com",
        phone: "555-0101",
      },
      {
        first: "Michael",
        last: "Chen",
        email: "michael@test.com",
        phone: "555-0102",
      },
      {
        first: "Emily",
        last: "Rodriguez",
        email: "emily@test.com",
        phone: "555-0103",
      },
    ];

    const insertedTenants = [];
    const passwordHash = await bcrypt.hash("tenant123", SALT_ROUNDS);

    for (const t of tenantsData) {
      // Create User
      const userRes = await client.query(
        `
        INSERT INTO users (first_name, last_name, email, password, role)
        VALUES ($1, $2, $3, $4, 'tenant') RETURNING id
      `,
        [t.first, t.last, t.email, passwordHash]
      );

      // Create Profile
      const tenantRes = await client.query(
        `
        INSERT INTO tenants (user_id, phone, status)
        VALUES ($1, $2, 'active') RETURNING id, user_id
      `,
        [userRes.rows[0].id, t.phone]
      );

      insertedTenants.push({ ...t, id: tenantRes.rows[0].id });
    }

    // Helper to find tenant ID by name
    const getTenantId = (name) =>
      insertedTenants.find((t) => t.first === name).id;

    // =============================================
    // 6. CREATE LEASES
    // =============================================
    console.log("📝 Creating Leases...");

    const leasesData = [
      // Sarah in Sunset 101 (Active)
      {
        tenant: "Sarah",
        unit: "101",
        start: "2024-01-01",
        end: "2024-12-31",
        rent: 1200,
        dep: 1200,
        status: "active",
      },
      // Michael in Oak Ridge 1A (Expiring soon)
      {
        tenant: "Michael",
        unit: "1A",
        start: "2023-06-01",
        end: "2024-06-01",
        rent: 1450,
        dep: 1450,
        status: "active",
      },
      // Emily in Downtown 3C (Active)
      {
        tenant: "Emily",
        unit: "3C",
        start: "2024-03-01",
        end: "2025-02-28",
        rent: 2500,
        dep: 2500,
        status: "active",
      },
    ];

    const insertedLeases = [];

    for (const l of leasesData) {
      const uId = getUnitId(l.unit);
      const tId = getTenantId(l.tenant);

      const res = await client.query(
        `
        INSERT INTO leases (tenant_id, unit_id, start_date, end_date, rent_amount, security_deposit, payment_day, status)
        VALUES ($1, $2, $3, $4, $5, $6, 1, $7)
        RETURNING id, rent_amount, start_date
      `,
        [tId, uId, l.start, l.end, l.rent, l.dep, l.status]
      );

      // Mark unit occupied
      await client.query(`UPDATE units SET status = 'occupied' WHERE id = $1`, [
        uId,
      ]);

      insertedLeases.push({ ...l, id: res.rows[0].id });
    }

    // =============================================
    // 7. CREATE PAYMENTS
    // =============================================
    console.log("💰 Creating Payments...");

    // Generate payments for the last 3 months for each lease
    for (const lease of insertedLeases) {
      const amounts = [lease.rent, lease.rent, lease.rent];
      // Dates: Jan, Feb, Mar (Mocking generic recent months)
      const dates = ["2024-01-01", "2024-02-01", "2024-03-01"];

      for (let i = 0; i < 3; i++) {
        // Sarah pays on time
        let status = "completed";
        let paidDate = dates[i];

        // Michael missed the last one (Late/Pending)
        if (lease.tenant === "Michael" && i === 2) {
          status = "pending"; // Current month pending
          paidDate = null;
        }

        await client.query(
          `
          INSERT INTO payments (lease_id, amount, due_date, payment_date, status, payment_method)
          VALUES ($1, $2, $3, $4, $5, 'bank_transfer')
        `,
          [lease.id, lease.rent, dates[i], paidDate, status]
        );
      }
    }

    await client.query("COMMIT");
    console.log("✅ Database Seeded Successfully!");

    console.log("\n🔑 Login Credentials:");
    console.log("   Admin:  admin@example.com / admin123");
    console.log("   Tenant: sarah@test.com    / tenant123");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Seeding Failed:", err);
  } finally {
    client.release();
    pool.end(); // Close connection
  }
}

seed();
