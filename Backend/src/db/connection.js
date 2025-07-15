// src/db/connection.js
// This file establishes a connection to MongoDB using the Node.js driver
import "dotenv/config";
import { MongoClient, ServerApiVersion } from "mongodb";

// 1) Read, trim, and log the connection string
const uri = process.env.MONGO_CONNECTION_STRING?.trim() || "";
console.log("→ MONGO_CONNECTION_STRING =", JSON.stringify(uri));
// Make sure this logs exactly "mongodb+srv://..." with no surrounding quotes/spaces

// 2) Create the MongoClient
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db;

// 3) Connect and verify
try {
  await client.connect();                      // Top‑level await (Node 14+ ESM)
  await client.db("admin").command({ ping: 1 });// Ping to confirm
  console.log("✅ Connected to MongoDB successfully");
  db = client.db("app");                       // Use (or create) your “app” database
} catch (error) {
  console.error("❌ Error connecting to MongoDB:", error);
  process.exit(1);                              // Exit if you can’t connect
}

// 4) Export the `db` instance for other modules
export default db;
