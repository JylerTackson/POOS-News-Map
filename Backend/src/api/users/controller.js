// src/api/users/controller.js
import mongoose from "mongoose";
import { userSchema } from "../../Mongoose/schemas.js";
const User = mongoose.model("User", userSchema, "users");

// REGISTER (Email/Password)
export async function register(req, res) {
  const { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName || !email || !password)
    return res.status(400).json({ error: "All fields required" });

  // Check if user exists
  const existing = await User.findOne({ email });
  if (existing)
    return res.status(409).json({ error: "User already exists" });

  // Save user
  try {
    const newUser = new User({
      firstName, lastName, email,
      passwordHash: password, // You should hash this!
      isVerified: false
    });
    await newUser.save();
    res.status(201).json({ message: "Registered", userId: newUser._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// LOGIN
export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password required" });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "User not found" });

  // NOTE: You must use real password hashing/check here!
  if (user.passwordHash !== password)
    return res.status(403).json({ error: "Incorrect password" });

  res.json({ message: "Login successful", userId: user._id });
}

// EMAIL VERIFICATION (stub)
export async function verifyEmail(req, res) {
  // You’d verify a token and set isVerified=true here
  res.json({ message: "Email verified (stub)" });
}

// PASSWORD RESET (stub)
export async function forgotPassword(req, res) {
  // Normally, generate a reset token, send email, etc.
  res.json({ message: "Password reset link sent (stub)" });
}

// GET USER BY EMAIL (for /api/users/:email)
export async function getUser(req, res) {
  const { email } = req.params;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user });
}

// UPDATE USER (stub)
export async function updateUser(req, res) {
  res.json({ message: "Update user (stub)" });
}

// DELETE USER (stub)
export async function deleteUser(req, res) {
  res.json({ message: "Delete user (stub)" });
}

// ADD FAVORITE (stub)
export async function addFavorite(req, res) {
  res.json({ message: "Add favorite (stub)" });
}

// REMOVE FAVORITE (stub)
export async function removeFavorite(req, res) {
  res.json({ message: "Remove favorite (stub)" });
}

// MOBILE/FIREBASE SIGNUP (upsert by firebaseUid)
export async function registerMobileUser(req, res) {
  const { email, firstName, lastName } = req.body;
  const firebaseUid = req.firebaseUid;
  const user = await User.findOneAndUpdate(
    { firebaseUid },
    { firebaseUid, email, firstName, lastName },
    { upsert: true, new: true }
  );
  return res.json({ user });
}
