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
userRoutes.get("/:id", userCtrl.getUser); // GET  /api/users/:id
userRoutes.patch("/:id", userCtrl.updateUser); // PATCH /api/users/:id
userRoutes.delete("/:id", userCtrl.deleteUser); // DELETE /api/users/:id

export default userRoutes;
