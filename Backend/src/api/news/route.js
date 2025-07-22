// src/api/news/route.js
import express from "express";
import cors from "cors";

const newsRoutes = express.Router();
newsRoutes.use(cors());
newsRoutes.use(express.json());

// Import all functions from controller
import {
  showDaily,
  searchByCountry,
  getCountryFromCoordinates,
} from "./controller.js";

/**
 * @openapi
 * tags:
 *   - name: News
 *     description: Daily news pulled from NewsAPI and stored in MongoDB
 *
 * /api/news/daily:
 *   get:
 *     summary: Get all stored daily news articles
 *     tags: [News]
 *     responses:
 *       200:
 *         description: Array of news articles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DailyNewsArticle'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 * /api/news/country/{country}:
 *   get:
 *     summary: Get all articles for a specific country
 *     tags: [News]
 *     parameters:
 *       - in: path
 *         name: country
 *         required: true
 *         description: 2‑letter country code (ISO 3166-1 alpha‑2) used by NewsAPI (e.g., "us", "gb")
 *         schema:
 *           type: string
 *           minLength: 2
 *           maxLength: 2
 *     responses:
 *       200:
 *         description: Array of news articles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DailyNewsArticle'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 * /api/news/country-from-coords/{lat}/{lng}:
 *   get:
 *     summary: Reverse geocode coordinates to a country
 *     tags: [News]
 *     parameters:
 *       - in: path
 *         name: lat
 *         required: true
 *         schema: { type: number }
 *       - in: path
 *         name: lng
 *         required: true
 *         schema: { type: number }
 *     responses:
 *       200:
 *         description: Country for the provided coordinates
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 country:
 *                   type: string
 *                   nullable: true
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

// mounting all /api/news/* hyperlinks
newsRoutes.get("/Daily", showDaily); // GET  /api/news/Daily
newsRoutes.get("/Country/:country", searchByCountry); // GET /api/news/Country/:country - FIXED: Added :country parameter
newsRoutes.get("/country-from-coords/:lat/:lng", getCountryFromCoordinates); // FIXED: Changed from newsCtrl to direct function

export default newsRoutes;
