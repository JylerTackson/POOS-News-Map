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
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  firebaseUid:   { type: String, unique: true, sparse: true },

  savedArticles: [savedArticlesSchema],
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
