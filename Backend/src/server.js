//Server and middleware
import express from "express";
import cors from "cors";

//Env Connections for Keys
import dotenv from "dotenv";
dotenv.config();

//Mongoose for MongoDB Connection
import mongoose from "mongoose";

//Fetch News Daily at 8 pm
import cron from "node-cron";
import { fetchAndStoreNews } from "./api/news/controller.js";

//Routes
import newsRoutes from "./api/news/route.js";
import userRoutes from "./api/users/route.js";
import teamRoutes from "./api/team/route.js";

//TODO: NEED TO MOVE INTO .env FILE
const uri = process.env.MONGO_URI;
const PORT = process.env.PORT || 5050;

//Create Express object
const app = express();

//Define Middleware
app.use(cors());
app.use(express.json());

//Mount Routes
app.use("/api/users", userRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/team", teamRoutes);

// main -- server functionality
async function main() {
  try {
    //1) Connect to Mongo
    //mongoose.connect() populates a global connection object.
    await mongoose.connect(uri, {
      dbName: "app",
    });
    console.log("MongoDB Connected using Mongoose");

    //2) Schedule Cron Jobs
    cron.schedule("0 8 * * *", async () => {
      try {
        fetchAndStoreNews();
      } catch (err) {
        console.log("Error: " + err);
      }
    });

    // 3) start server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`server listening on port http://0.0.0.0:${PORT}`);
    });
  } catch (err) {
    console.error("startup error", err);
    process.exit(1);
  }
}

main();
