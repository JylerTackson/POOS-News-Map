// src/api/users/route.js
import express from "express";
import cors from "cors";

const userRoutes = express.Router();
userRoutes.use(cors());
userRoutes.use(express.json());

// src/api/users/route.js
import * as userCtrl from "./controller.js";

/**
 * @openapi
 * tags:
 *   - name: Users
 *     description: Registration, login, profile management & favorites
 *
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegisterInput'
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserPublic'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 * /api/users/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLoginInput'
 *     responses:
 *       201:
 *         description: Login success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserPublic'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Email not verified
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 * /api/users/{email}:
 *   get:
 *     summary: Get user by email
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *     responses:
 *       201:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserPublicWithFavorites'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 * /api/users/update/{id}:
 *   patch:
 *     summary: Update a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdateInput'
 *     responses:
 *       200:
 *         description: Updated user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Update:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/UserPublic'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 * /api/users/delete/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 * /api/users/verify-email:
 *   get:
 *     summary: Verify email using token & id
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Email verified
 *       400:
 *         description: Invalid or expired token
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 * /api/users/forgot-password:
 *   post:
 *     summary: Send a temporary password to the user's email
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Success (even if email doesn't exist)
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 * /api/users/{id}/favorites:
 *   post:
 *     summary: Add a favorite article
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SavedArticle'
 *     responses:
 *       200:
 *         description: Article favorited; returns updated favorites
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 savedArticles:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SavedArticle'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 *   delete:
 *     summary: Remove a favorite article
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [headline, source]
 *             properties:
 *               headline: { type: string }
 *               source: { type: string }
 *     responses:
 *       200:
 *         description: Article unfavorited; returns updated favorites
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

// mounting all /api/users/* hyperlinks
userRoutes.post("/register", userCtrl.register); // POST /api/users/register
userRoutes.post("/login", userCtrl.login); // POST /api/users/login
userRoutes.get("/verify-email", userCtrl.verifyEmail); // GET /api/users/verify-email?token=…&id=…
userRoutes.get("/:email", userCtrl.getUser); // GET  /api/users/:email
userRoutes.patch("/update/:id", userCtrl.updateUser); // PATCH /api/users/update/:id
userRoutes.delete("/delete/:id", userCtrl.deleteUser); // DELETE /api/users/delete/:id
userRoutes.post("/forgot-password", userCtrl.forgotPassword); // POST /api/users/forgot-password
userRoutes.post("/:id/favorites", userCtrl.addFavorite); // POST /api/users/:id/favorites
userRoutes.delete("/:id/favorites", userCtrl.removeFavorite); // DELETE /api/users/:id/favorites

export default userRoutes;
