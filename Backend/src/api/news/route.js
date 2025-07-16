// src/api/news/route.js
import express from "express";
import cors from "cors";

const newsRoutes = express.Router();
newsRoutes.use(cors());
newsRoutes.use(express.json());

// src/api/users/route.js
import { showDaily, showFav, searchByCountry } from "./controller.js";

// mounting all /api/news/* hyperlinks
newsRoutes.get("/Daily", showDaily); // GET  /pages/Daily
newsRoutes.get("/Favorites", showFav); // GET  /pages/Favorites
newsRoutes.get("/Country", searchByCountry); //GET /pages/Home Sidebar

export default newsRoutes;
