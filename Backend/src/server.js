// Backend/src/server.js

import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';

import registration from './api/users/route.js';
import dailyNews   from './api/dailyNews/route.js';

const app  = express();
const PORT = process.env.PORT || 5050;

// === CORS: allow everything in development ===
app.use(cors());          // allow all origins
app.options('*', cors()); // enable pre-flight for all routes

app.use(express.json());

app.use('/api/users/route', registration);
app.use('/api/dailyNews/route', dailyNews);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
