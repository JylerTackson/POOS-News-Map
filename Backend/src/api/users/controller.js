//express server
import express from "express";
const router = express.Router();

//mongoose schema
import { userSchema } from "../../Mongoose/schemas.js";
import mongoose from "mongoose";
//Token generation
import crypto from "crypto";
//Email verification
import { sendVerificationEmail } from "../../utils/sendEmail.js";

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
    const newUser = await userModel.create({
      firstName,
      lastName,
      email,
      password,
      isVerified: false,
    });

    // 4. Generate verifictaion token with expiration date
    const emailToken = crypto.randomBytes(32).toString("hex")
    newUser.verifyToken = emailToken;
    newUser.verifyTokenExpires = Date.now()+1000*60*60 //1 hour

    await newUser.save(); // add user while waiting
    await sendVerificationEmail(newUser.email, emailToken, newUser._id);

    // 5. reply with the new document’s ID
    return res.status(201).json({
      Registration: "Success",
      message: "User created; awaiting email verification",
      ID: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      isVerified: newUser.isVerified,
    });

  } catch (err) {
    return res
      .status(500)
      .json({ Registration: "Failure", Error: err.message });
  }
}

// GET /api/users/login
//Login given user information
async function login(req, res) {
  //1) Grab your payload
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      Registration: "Failure",
      Error: "Both Email and Password are required",
    });
  }

  //2) Search for user
  try {
    const found = await userModel.findOne({email: email});
    if (found.password === password) {
      return res.status(201).json({
        Login: "Success",
        _id: found._id,
        firstName: found.firstName,
        lastName: found.lastName,
        email: found.email,
      });
    } else {
      return res.status(203).json({
        Login: "Failure",
        userId: found._id,
      });
    }
  } catch (err) {
    return res.status(500).json({ Login: "Failure", Error: err.message });
  }
}

// GET  /api/users/:id
//Return user information given ID
async function getUser(req, res) {
  try {
    // look up by the URL param, not by passing the whole req object
    const foundUser = await userModel.findById(req.params.id);

    if (!foundUser) {
      return res.status(404).json({ LookupError: "no user with that ID" });
    }

    // send back the actual user document
    res.status(200).json({ LookupSuccess: foundUser });
  } catch (err) {
    // if something goes wrong, err.message will be defined
    res.status(500).json({ LookupError: err.message });
  }
}

// PATCH /api/users/:id
//Update user given the ID
async function updateUser(req, res) {}

// DELETE /api/users/:id
//Delete a user given the Id
async function deleteUser(req, res) {}


// GET /api/users/verify-email?token=…&id=…
//Gets 
async function verifyEmail(req, res) {
  const { token, id } = req.query;
  try {
    const user = await userModel.findOne({
      _id: id,
      verifyToken: token,
      verifyTokenExpires: { $gt: Date.now() }
    });
    if (!user) {
      return res
        .status(400)
        .json({ verified: "failure", error: "Invalid or expired token." });
    }

    user.isVerified         = true;
    user.verifyToken        = undefined;
    user.verifyTokenExpires = undefined;
    await user.save();

    return res.json({
      verified: "success",
      user: {
        id:         user._id,
        firstName:  user.firstName,
        lastName:   user.lastName,
        email:      user.email,
        isVerified: user.isVerified
      }
    });
  } catch (err) {
    return res
      .status(500)
      .json({ verified: "failure", error: err.message });
  }
}

export { register, login, getUser, updateUser, deleteUser, verifyEmail };
