// src/api/news/route.js
import express from "express";
import cors from "cors";

const teamRoutes = express.Router();
teamRoutes.use(cors());
teamRoutes.use(express.json());

// src/api/users/route.js
import { retrieveTeamInfo } from "./controller.js";

/**
 * @openapi
 * tags:
 *   - name: Team
 *     description: Project team member info
 *
 * /api/team:
 *   get:
 *     summary: Retrieve all team members
 *     tags: [Team]
 *     responses:
 *       200:
 *         description: Array of team members
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TeamMember'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

// mounting all /api/news/* hyperlinks
teamRoutes.get("/About", retrieveTeamInfo); // GET  /pages/Daily

export default teamRoutes;
