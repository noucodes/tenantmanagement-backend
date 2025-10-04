const express = require("express");
const routes = require("./routes");
const pool = require("./config/db");
const {
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
} = require("../initdb");
const cors = require("cors");

const app = express();
app.use(express.json());

app.use(cors({ origin: true, credentials: true }));

// API routes
app.use("/api", routes);

async function initDB() {
  try {
    console.log("🚀 Starting table initialization...");
    await userTable();
    await companiesTable();
    await categoriesTable();
    await ticketsTable();
    await ticketsCommentsTable();
    await attachmentsTable();
    await knowledgeBaseTable();
    await systemStatusTable();
    await userPreferencesTable();
    await auditLogTable();
  } catch (error) {
    console.error("❌ Error initializing DB:", error);
  } finally {
    console.log("✅ All tables created (or already exist).");
  }
}

module.exports = { app, initDB };
