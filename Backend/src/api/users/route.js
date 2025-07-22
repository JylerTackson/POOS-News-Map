// src/api/users/route.js
import express from "express";
import cors from "cors";

const userRoutes = express.Router();
userRoutes.use(cors());
userRoutes.use(express.json());

// src/api/users/route.js
import * as userCtrl from "./controller.js";

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