import mongoose from "mongoose";
const { Schema } = mongoose;

const savedArticlesSchema = new Schema({
  country: String,
  headline: String,
  body: String,
  date: Date,
  source: String,
  favorite: Boolean,
});

const userSchema = new Schema({
  id: Number,
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  savedArticles: [],
  // fields for password reset
  resetPasswordToken: String,
  resetPasswordExpires: Date
});

const dailyNewsSchema = new Schema({
  country: String,
  headline: String,
  body: String,
  date: Date,
  source: String,
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
