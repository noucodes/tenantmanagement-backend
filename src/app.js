// src/app.js
const express = require("express");
const routes = require("./routes");
const { createTables } = require("../initdb");
const cors = require("cors");

const app = express();
app.use(express.json());

app.use(cors({ origin: true, credentials: true }));

// API routes
app.use("/api", routes);

async function initDB() {
  try {
    console.log("🚀 Starting table initialization...");
    await createTables();
  } catch (error) {
    console.error("❌ Error initializing DB:", error);
  }
}

module.exports = { app, initDB };
