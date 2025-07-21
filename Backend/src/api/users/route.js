// src/api/users/route.js
import express from "express";
import cors from "cors";
import * as userCtrl from "./controller.js";
import authMiddleware from "./auth_middleware.js";

const userRoutes = express.Router();

userRoutes.use(cors());
userRoutes.use(express.json());

userRoutes.post("/register", userCtrl.register);
userRoutes.post("/login", userCtrl.login);
userRoutes.get("/verify-email", userCtrl.verifyEmail);
userRoutes.post("/forgot-password", userCtrl.forgotPassword);

userRoutes.get("/:email", userCtrl.getUser);
userRoutes.patch("/update/:id", userCtrl.updateUser);
userRoutes.delete("/delete/:id", userCtrl.deleteUser);

userRoutes.post("/:id/favorites", userCtrl.addFavorite);
userRoutes.delete("/:id/favorites", userCtrl.removeFavorite);

// Firebase mobile signup
userRoutes.post(
  "/mobile-signup",
  authMiddleware,
  userCtrl.registerMobileUser
);

export default userRoutes;
