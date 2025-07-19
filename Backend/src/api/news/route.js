// src/api/news/route.js
import express from "express";
import cors from "cors";

const newsRoutes = express.Router();
newsRoutes.use(cors());
newsRoutes.use(express.json());

// Import all functions from controller
import { showDaily, searchByCountry, getCountryFromCoordinates } from "./controller.js";

// mounting all /api/news/* hyperlinks
newsRoutes.get("/Daily", showDaily); // GET  /api/news/Daily
newsRoutes.get("/Country/:country", searchByCountry); // GET /api/news/Country/:country - FIXED: Added :country parameter
newsRoutes.get("/country-from-coords/:lat/:lng", getCountryFromCoordinates); // FIXED: Changed from newsCtrl to direct function

export default newsRoutes;