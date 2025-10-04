const pool = require("./src/config/db");

async function userTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        role VARCHAR(50) DEFAULT 'USER',
        employee_id VARCHAR(45) UNIQUE,
        login_attempts INTEGER DEFAULT 0,
        locked_until TIMESTAMP,
        suspended BOOLEAN DEFAULT FALSE
    );
    `);

    console.log("✅ Users table created (or already exists).");
  } catch (err) {
    console.error("❌ Error creating users table:", err);
  }
}

async function companiesTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    domain VARCHAR(100),
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    subscription_plan VARCHAR(50) DEFAULT 'basic',
    max_users INTEGER DEFAULT 50,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);`);
    console.log("✅ Companies table created (or already exists).");
  } catch (error) {
    console.error("❌ Error creating companies table:", err);
  }
}

async function categoriesTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    company_id UUID REFERENCES companies(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`);
    console.log("✅ Categories table created (or already exists).");
  } catch (error) {
    console.error("❌ Error creating categories table:", err);
  }
}

async function ticketsTable() {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'pending', 'resolved', 'closed')),
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    category_id UUID REFERENCES categories(id),
    user_id UUID NOT NULL REFERENCES users(id),
    assigned_to UUID REFERENCES users(id),
    company_id UUID REFERENCES companies(id),
    resolution TEXT,
    estimated_hours DECIMAL(5,2),
    actual_hours DECIMAL(5,2),
    due_date TIMESTAMP,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`);
    console.log("✅ Tickets table created (or already exists).");
  } catch (error) {
    console.error("❌ Error creating tickets table:", err);
  }
}

async function ticketsCommentsTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ticket_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    comment TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    is_solution BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`);
    console.log("✅ Ticket comments table created (or already exists).");
  } catch (error) {
    console.error("❌ Error creating ticket comments table:", err);
  }
}

async function attachmentsTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES ticket_comments(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_path TEXT NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`);
    console.log("✅ Attachments table created (or already exists).");
  } catch (error) {
    console.error("❌ Error creating attachments table:", err);
  }
}

async function knowledgeBaseTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS knowledge_base_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    category_id UUID REFERENCES categories(id),
    author_id UUID NOT NULL REFERENCES users(id),
    company_id UUID REFERENCES companies(id),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    view_count INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,
    tags TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP
);
`);
    console.log("✅ Knowledge Base table created (or already exists).");
  } catch (error) {
    console.error("❌ Error creating knowledge base table:", err);
  }
}

async function systemStatusTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS system_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'operational' CHECK (status IN ('operational', 'maintenance', 'degraded', 'outage')),
    severity VARCHAR(10) DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
    affected_services TEXT[],
    company_id UUID REFERENCES companies(id),
    created_by UUID NOT NULL REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE,
    scheduled_start TIMESTAMP,
    scheduled_end TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`);
    console.log("✅ System status table created (or already exists).");
  } catch (error) {
    console.error("❌ Error creating system status table:", err);
  }
}

async function userPreferencesTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    desktop_notifications BOOLEAN DEFAULT TRUE,
    theme VARCHAR(10) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
    language VARCHAR(5) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'UTC',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);
      `);
    console.log("✅ User Preferences table created (or already exists).");
  } catch (error) {
    console.error("❌ Error creating user preferences table:", err);
  }
}

async function auditLogTable() {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(10) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    user_id UUID REFERENCES users(id),
    company_id UUID REFERENCES companies(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`);
    console.log("✅ Audit Log table created (or already exists).");
  } catch (error) {
    console.error("❌ Error creating audit log table:", err);
  }
}

module.exports = {
  userTable,
  companiesTable,
  categoriesTable,
  ticketsTable,
  ticketsCommentsTable,
  attachmentsTable,
  knowledgeBaseTable,
  systemStatusTable,
  userPreferencesTable,
  auditLogTable,
};
