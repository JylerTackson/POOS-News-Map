/**
 * @openapi
 * components:
 *   schemas:
 *     DailyNewsArticle:
 *       type: object
 *       properties:
 *         country: { type: string, nullable: true }
 *         headline: { type: string }
 *         body: { type: string }
 *         date: { type: string, format: date-time }
 *         source: { type: string }
 *         url: { type: string, format: uri }
 *         urlToImage: { type: string, format: uri, nullable: true }
 *         favorite: { type: boolean }
 *
 *     SavedArticle:
 *       allOf:
 *         - $ref: '#/components/schemas/DailyNewsArticle'
 *
 *     UserPublic:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         firstName: { type: string }
 *         lastName: { type: string }
 *         email: { type: string, format: email }
 *         avatarUrl: { type: string, format: uri, nullable: true }
 *
 *     UserPublicWithFavorites:
 *       allOf:
 *         - $ref: '#/components/schemas/UserPublic'
 *         - type: object
 *           properties:
 *             savedArticles:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SavedArticle'
 *
 *     UserRegisterInput:
 *       type: object
 *       required: [firstName, lastName, email, password]
 *       properties:
 *         firstName: { type: string }
 *         lastName: { type: string }
 *         email: { type: string, format: email }
 *         password: { type: string, format: password, minLength: 6 }
 *
 *     UserLoginInput:
 *       type: object
 *       required: [email, password]
 *       properties:
 *         email: { type: string, format: email }
 *         password: { type: string, format: password }
 *
 *     UserUpdateInput:
 *       type: object
 *       properties:
 *         firstName: { type: string }
 *         lastName: { type: string }
 *         email: { type: string, format: email }
 *         password: { type: string, format: password }
 *         avatarUrl: { type: string, format: uri }
 *
 *     TeamMember:
 *       type: object
 *       properties:
 *         fullName: { type: string }
 *         role: { type: string }
 *         degree: { type: string }
 *         gradYear: { type: integer }
 *         description: { type: string }
 *         headshot:
 *           type: object
 *           properties:
 *             data: { type: string, description: "Base64-encoded image" }
 *             contentType: { type: string }
 *
 *   responses:
 *     BadRequest:
 *       description: Missing or invalid parameters
 *     Unauthorized:
 *       description: Authentication failed
 *     Conflict:
 *       description: Resource already exists / conflict
 *     NotFound:
 *       description: Resource not found
 *     ServerError:
 *       description: Internal server error
 */

import mongoose from "mongoose";
const { Schema } = mongoose;

const savedArticlesSchema = new Schema({
  country: String,
  headline: String,
  body: String,
  date: Date,
  source: String,
  url: String, // ADD THIS LINE
  urlToImage: String, // ADD THIS LINE
  favorite: Boolean,
});

const userSchema = new Schema({
  id: Number,
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  savedArticles: [],
  isVerified: { type: Boolean, default: false },
  verifyToken: String,
  verifyTokenExpires: Date,
  // fields for password reset
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

const dailyNewsSchema = new Schema({
  country: String,
  headline: String,
  body: String,
  date: Date,
  source: String,
  url: String, // ADD THIS LINE
  urlToImage: String, // ADD THIS LINE
  favorite: Boolean,
});

const teamSchema = new Schema({
  fullName: String,
  role: String,
  degree: String,
  gradYear: Number,
  description: String,
  headshot: {
    data: Buffer, // the raw binary data
    contentType: String, // e.g. "image/jpeg" or "image/png"
  },
});

export { userSchema, dailyNewsSchema, teamSchema };
