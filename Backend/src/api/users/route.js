// src/api/users/route.js
import express from "express";
const userRoutes = express.Router();

// src/api/users/route.js
import * as userCtrl from "./controller.js";

// mounting all /api/users/* hyperlinks
userRoutes.post("/register", userCtrl.register); // POST /api/users/register
userRoutes.post("/login", userCtrl.login); // POST /api/users/login
userRoutes.get("/:id", userCtrl.getUser); // GET  /api/users/:id
userRoutes.patch("/:id", userCtrl.updateUser); // PATCH /api/users/:id
userRoutes.delete("/:id", userCtrl.deleteUser); // DELETE /api/users/:id

export default userRoutes;
