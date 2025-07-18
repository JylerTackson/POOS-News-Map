// src/api/news/route.js
import express from "express";
const newsRoutes = express.Router();

// src/api/users/route.js
import { showDaily, showFav, searchByCountry } from "./controller.js";

// mounting all /api/news/* hyperlinks
newsRoutes.get("/Daily", showDaily); // GET  /pages/Daily
newsRoutes.get("/Favorites", showFav); // GET  /pages/Favorites
newsRoutes.get("/Country", searchByCountry); //GET /pages/Home Sidebar

export default newsRoutes;
