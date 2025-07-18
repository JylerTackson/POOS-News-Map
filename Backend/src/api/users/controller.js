//express server
import express from "express";
const router = express.Router();

// Import bcryptjs for password hashing
import bcrypt from "bcryptjs";

//mongoose schema
import { userSchema } from "../../Mongoose/schemas.js";
import mongoose from "mongoose";
const userModel = mongoose.model("users", userSchema, "users");

// POST /api/users/register
//Register a user
//TODO: Create a new collection for each member to house their favorited items.
async function register(req, res) {
  // 1. grab your payload
  const { firstName, lastName, email, password } = req.body;

  const payload = req.body;
  console.log("payload: ", payload);

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({
      Registration: "Failure",
      Error: "All Schema information required",
    });
  }

  // 2. check for existing user
  const existing = await userModel.findOne({ email });
  if (existing) {
    return res
      .status(409)
      .json({ Registration: "Failure", Error: "User already exists" });
  }

  // 3. create & save
  try {
    // Hash the password before saving
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await userModel.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,  // <-- Now storing the hashed password
    });

    // 4. reply with the new document’s ID
    return res.status(201).json({
      Registration: "Success",
      ID: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ Registration: "Failure", Error: err.message });
  }
}

// POST /api/users/login
async function login(req, res) {
  //1) Grab your payload
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      Login: "Failure",
      Error: "Both Email and Password are required",
    });
  }

  //2) Search for user
  try {
    const found = await userModel.findOne({ email: req.body.email });
    
    if (!found) {
      // User not found
      return res.status(401).json({
        Login: "Failure",
        Error: "Invalid email or password"
      });
    }

    // Compare the provided password with the hashed password
    const isPasswordValid = await bcrypt.compare(password, found.password);
    
    if (isPasswordValid) {
      return res.status(201).json({
        Login: "Success",
        _id: found._id,
        firstName: found.firstName,
        lastName: found.lastName,
        email: found.email,
        avatarUrl: found.avatarUrl,
      });
    } else {
      return res.status(401).json({
        Login: "Failure",
        Error: "Invalid email or password"
      });
    }
  } catch (err) {  // <-- This goes OUTSIDE the if/else, paired with try
    return res.status(500).json({ Login: "Failure", Error: err.message });
  }
}

// GET  /api/users/:email
async function getUser(req, res) {
  try {
    const email = req.params.email;
    const found = await userModel.findOne({
      email: email,
    });

    if (!found) {
      return res.status(404).json({ error: "User Not Found" });
    } else {
      // Don't include password in response
      res.status(201).json({
        _id: found._id,
        firstName: found.firstName,
        lastName: found.lastName,
        email: found.email,
        avatarUrl: found.avatarUrl
      });
    }
  } catch (err) {
    return res.status(500).json({ error: { err } });
  }
}

// PATCH /api/users/update/:id
//Update user given the ID
async function updateUser(req, res) {
  try {
    const userId = req.params.id;
    const updates = req.body;

    // If password is being updated, hash it first
    if (updates.password) {
      const saltRounds = 10;
      updates.password = await bcrypt.hash(updates.password, saltRounds);
    }
    
    // If email is being updated, check if it's already taken
    if (updates.email) {
      const emailExists = await userModel.findOne({ 
        email: updates.email,
        _id: { $ne: userId }  // Exclude current user from check
      });
      
      if (emailExists) {
        return res.status(409).json({
          Update: "Failure",
          Error: "Email already in use"
        });
      }
    }
    
    // Update the user
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }  // Return updated doc & run schema validation
    );
    
    if (!updatedUser) {
      return res.status(404).json({ 
        Update: "Failure",
        Error: "User not found" 
      });
    }
    
    // Return user without password
    return res.status(200).json({
      Update: "Success",
      user: {
        _id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        avatarUrl: updatedUser.avatarUrl,
      }
    });
  } catch (err) {
    return res.status(500).json({ 
      Update: "Failure", 
      Error: err.message 
    });
  }
}

// DELETE /api/users/delete/:id
//Delete a user given the Id
async function deleteUser(req, res) {}

export { register, login, getUser, updateUser, deleteUser };
