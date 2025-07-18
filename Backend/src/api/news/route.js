// src/api/news/route.js
import express from "express";
import cors from "cors";

const newsRoutes = express.Router();
newsRoutes.use(cors());
newsRoutes.use(express.json());

// src/api/users/route.js
import { showDaily, searchByCountry } from "./controller.js";

// mounting all /api/news/* hyperlinks
newsRoutes.get("/Daily", showDaily); // GET  /api/news
newsRoutes.get("/Country", searchByCountry); //GET /api/news/country

export default newsRoutes;
