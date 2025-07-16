// src/api/news/route.js
import express from "express";
import cors from "cors";

const teamRoutes = express.Router();
teamRoutes.use(cors());
teamRoutes.use(express.json());

// src/api/users/route.js
import { retrieveTeamInfo } from "./controller.js";

// mounting all /api/news/* hyperlinks
teamRoutes.get("/About", retrieveTeamInfo); // GET  /pages/Daily

export default teamRoutes;
