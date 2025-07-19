//express server
import express from "express";
const router = express.Router();

// Import bcryptjs for password hashing
import bcrypt from "bcryptjs";

// Import SendGrid for password recovery
import sgMail from '@sendgrid/mail';

// Configure SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

//mongoose schema
import { userSchema } from "../../Mongoose/schemas.js";
import mongoose from "mongoose";

//Token generation
import crypto from "crypto";

const userModel = mongoose.model("users", userSchema, "users");

// POST /api/users/register
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

    // Generate verification token
    const verifyToken = crypto.randomBytes(32).toString("hex");
    
    const newUser = await userModel.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      isVerified: false,
      verifyToken: verifyToken,
      verifyTokenExpires: Date.now() + 3600000 // 1 hour
    });

    // Send verification email using SendGrid
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verifyToken}&id=${newUser._id}`;
    
    const msg = {
      to: email,
      from: process.env.EMAIL_FROM,
      subject: 'Verify your NewsMap account',
      text: `Hello ${firstName},\n\nPlease verify your email by clicking this link: ${verifyUrl}\n\nThis link expires in 1 hour.\n\nBest regards,\nNewsMap Team`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Email Verification</h2>
          <p>Hello ${firstName},</p>
          <p>Thank you for registering with NewsMap!</p>
          <p>Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email
            </a>
          </div>
          <p>Or copy and paste this link: ${verifyUrl}</p>
          <p>This link expires in 1 hour.</p>
          <br>
          <p>Best regards,<br>NewsMap Team</p>
        </div>
      `
    };
    
    await sgMail.send(msg);

    // 4. reply with success
    return res.status(201).json({
      Registration: "Success",
      ID: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      message: "Please check your email to verify your account"
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
        avatarUrl: found.avatarUrl,
        savedArticles: found.savedArticles  // ADD THIS LINE
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
async function deleteUser(req, res) {
  try {
    const userId = req.params.id;
    
    // Find and delete the user
    const deletedUser = await userModel.findByIdAndDelete(userId);
    
    if (!deletedUser) {
      return res.status(404).json({ 
        Delete: "Failure",
        Error: "User not found" 
      });
    }
    
    return res.status(200).json({
      Delete: "Success",
      message: "User deleted successfully",
      deletedUser: {
        _id: deletedUser._id,
        firstName: deletedUser.firstName,
        lastName: deletedUser.lastName,
        email: deletedUser.email
      }
    });
  } catch (err) {
    return res.status(500).json({ 
      Delete: "Failure", 
      Error: err.message 
    });
  }
}

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

// POST /api/users/forgot-password
// Send temporary password to user's email
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        ForgotPassword: "Failure",
        Error: "Email is required"
      });
    }
    
    // Find user by email
    const user = await userModel.findOne({ email });
    
    if (!user) {
      // Don't reveal if email exists or not (security best practice)
      return res.status(200).json({
        ForgotPassword: "Success",
        message: "If an account exists, a temporary password has been sent"
      });
    }
    
    // Generate temporary password (8 characters)
    const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4);
    
    // Hash the temporary password
    const hashedTempPassword = await bcrypt.hash(tempPassword, 10);
    
    // Update user's password
    await userModel.findByIdAndUpdate(user._id, {
      password: hashedTempPassword
    });
    
    // Send email with temporary password
    const msg = {
      to: user.email,
      from: process.env.EMAIL_FROM, // Must be verified in SendGrid
      subject: 'Your Temporary Password - News Map',
      text: `Hello ${user.firstName},\n\nYour temporary password is: ${tempPassword}\n\nPlease login and change your password immediately.\n\nBest regards,\nNews Map Team`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Password Reset Request</h2>
          <p>Hello ${user.firstName},</p>
          <p>Your temporary password is:</p>
          <div style="background-color: #f4f4f4; padding: 10px; font-size: 18px; font-weight: bold; margin: 20px 0;">
            ${tempPassword}
          </div>
          <p><strong>Please login and change your password immediately.</strong></p>
          <p>If you didn't request this password reset, please contact us immediately.</p>
          <br>
          <p>Best regards,<br>News Map Team</p>
        </div>
      `
    };
    
    await sgMail.send(msg);
    
    return res.status(200).json({
      ForgotPassword: "Success",
      message: "Temporary password sent to email"
    });
    
  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({
      ForgotPassword: "Failure",
      Error: "Failed to process password reset"
    });
  }
}

// POST /api/users/:id/favorites
// Add a favorite article
async function addFavorite(req, res) {
  try {
    const userId = req.params.id;
    const article = req.body; // The news article to save
    
    // Find user and add article to savedArticles array
    const user = await userModel.findByIdAndUpdate(
      userId,
      { $push: { savedArticles: article } },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.status(200).json({ 
      message: "Article favorited",
      savedArticles: user.savedArticles 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// DELETE /api/users/:id/favorites
// Remove a favorite article
async function removeFavorite(req, res) {
  try {
    const userId = req.params.id;
    const { headline, source } = req.body; // Identify article by headline and source
    
    // Find user and remove article from savedArticles array
    const user = await userModel.findByIdAndUpdate(
      userId,
      { 
        $pull: { 
          savedArticles: { 
            headline: headline,
            source: source 
          } 
        } 
      },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.status(200).json({ 
      message: "Article unfavorited",
      savedArticles: user.savedArticles 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export { register, login, getUser, updateUser, deleteUser, verifyEmail, forgotPassword, addFavorite, removeFavorite };
