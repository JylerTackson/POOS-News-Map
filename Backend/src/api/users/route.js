// Backend/src/api/users/route.js

import express from 'express';
import db from '../../db/connection.js';  // your Mongo handle

const router = express.Router();

// POST /api/users/route/register
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, username, password } = req.body;

    const users = db.collection('users');

    // Optional: check duplicates
    // await users.findOne({ email })…

    const result = await users.insertOne({
      firstName,
      lastName,
      email,
      username,
      password,
      createdAt: new Date(),
    });

    return res.status(201).json({
      message: 'User registered',
      userId:   result.insertedId
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({
      message: 'Registration failed',
      error:   err.message
    });
  }
});

export default router;
