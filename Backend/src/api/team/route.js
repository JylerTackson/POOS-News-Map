// src/api/news/route.js
import express from "express";
const teamRoutes = express.Router();

// src/api/users/route.js
import { retrieveTeamInfo } from "./controller.js";

// mounting all /api/news/* hyperlinks
teamRoutes.get("/About", retrieveTeamInfo); // GET  /pages/Daily

export default teamRoutes;
