// src/api/users/auth_middleware.js
import admin from "firebase-admin";

export default async function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const idToken = header.split("Bearer ")[1];
    if (!idToken) throw new Error("No token");
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.firebaseUid = decoded.uid;
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}
