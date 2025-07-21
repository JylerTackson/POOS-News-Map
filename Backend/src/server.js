
import express      from "express";
import cors         from "cors";
import dotenv       from "dotenv";
import mongoose     from "mongoose";
import cron         from "node-cron";
import admin        from "firebase-admin";
import fs           from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import newsRoutes            from "./api/news/route.js";
import userRoutes            from "./api/users/route.js";
import teamRoutes            from "./api/team/route.js";
import { fetchAndStoreNews } from "./api/news/controller.js";

dotenv.config();

// ——————————————————————————————————————————————
// 1) Load Firebase service account
let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
} else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
  // read from a local JSON file
  const raw = fs.readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, "utf8");
  serviceAccount = JSON.parse(raw);
} else {
  throw new Error("No Firebase service account provided in env");
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// ——————————————————————————————————————————————
// 2) Create Express app
const app = express();
app.use(cors());
app.use(express.json());

// 3) Mount API routes
app.use("/api/users", userRoutes);
app.use("/api/news",  newsRoutes);
app.use("/api/team",  teamRoutes);

// ——————————————————————————————————————————————
// 4) (Optional) Serve Flutter Web build
const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);
// go up two levels (src → Backend → project root) then into Frontend/dist
const buildPath  = join(__dirname, "..", "..", "Frontend", "dist");
app.use(express.static(buildPath));
app.get(/^.*$/, (_req, res) =>
  res.sendFile(join(buildPath, "index.html"))
);

// ——————————————————————————————————————————————
// 5) Connect to Mongo, schedule cron, start server
const PORT = process.env.PORT || 5050;

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { dbName: "app" });
    console.log("✅ MongoDB connected");

    cron.schedule("0 8 * * *", fetchAndStoreNews);
    console.log("⏰ Scheduled daily news fetch at 08:00");
    
    app.listen(PORT, () => {
      console.log(`🚀 Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("🔥 Startup error:", err);
    process.exit(1);
  }
  app.get('/users', async (req, res) => {
  // ... your handler logic ...
  const users = await getAllUsers(); 
  res.json(users);
});
}

main();