jest.mock('@sendgrid/mail', () => ({
  setApiKey: jest.fn(),
  send: jest.fn().mockResolvedValue({}),
}));

import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { userSchema } from '../../src/Mongoose/schemas.js';

import {
  register,
  login,
  getUser,
  updateUser,
  deleteUser,
  verifyEmail,
  forgotPassword,
  addFavorite,
  removeFavorite,
} from '../../src/api/users/controller.js';

let app;
let mongoServer;
let testUserId;
let testVerifyToken;

beforeAll(async () => {
  // Start in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Register schema
  mongoose.model('users', userSchema, 'users');

  // Express app setup
  app = express();
  app.use(bodyParser.json());

  const router = express.Router();

  // 1) Auth & misc
  router.post('/register', register);
  router.post('/login', login);

  // 2) Email verification must come *before* the catch‑all `/:email` route
  router.get('/verify-email', verifyEmail);

  // 3) User lookup by email
  router.get('/:email', getUser);

  // 4) Updates & deletes
  router.patch('/update/:id', updateUser);
  router.delete('/delete/:id', deleteUser);

  // 5) Password reset
  router.post('/forgot-password', forgotPassword);

  // 6) Favorites
  router.post('/:id/favorites', addFavorite);
  router.delete('/:id/favorites', removeFavorite);

  // mount under `/api/users`
  app.use('/api/users', router);

  // Set test environment variables
  process.env.FRONTEND_URL = 'http://localhost';
  process.env.EMAIL_FROM = 'test@sender.com';
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Users API integration', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({
        firstName: 'John',
        lastName:  'Doe',
        email:     'john@example.com',
        password:  'secret'
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.firstName).toBe('John');
    testUserId = res.body._id;
  });

  it('should not allow duplicate registration', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({
        firstName: 'John',
        lastName:  'Doe',
        email:     'john@example.com',
        password:  'secret'
      });
    expect(res.status).toBe(409);
  });

  it('should verify email', async () => {
    // grab the verifyToken from the DB
    const User = mongoose.model('users');
    const user = await User.findById(testUserId).lean();
    testVerifyToken = user.verifyToken;

    const res = await request(app)
      .get('/api/users/verify-email')
      .query({ token: testVerifyToken, id: testUserId });

    expect(res.status).toBe(200);
    expect(res.body.verified).toBe('success');
  });

  it('should login with correct credentials', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ email: 'john@example.com', password: 'secret' });

    // your controller returns 201 on success
    expect(res.status).toBe(201);
    expect(res.body.Login).toBe('Success');
  });

  it('should get user details', async () => {
    const res = await request(app).get('/api/users/john@example.com');
    expect(res.status).toBe(201);
    expect(res.body.email).toBe('john@example.com');
  });

  it('should update user', async () => {
    const res = await request(app)
      .patch(`/api/users/update/${testUserId}`)
      .send({ firstName: 'Jane' });
    expect(res.status).toBe(200);
    expect(res.body.user.firstName).toBe('Jane');
  });

  it('should add a favorite article', async () => {
    const article = { headline: 'News', source: 'Source' };
    const res = await request(app)
      .post(`/api/users/${testUserId}/favorites`)
      .send(article);
    expect(res.status).toBe(200);
    expect(res.body.savedArticles).toEqual(
      expect.arrayContaining([expect.objectContaining(article)])
    );
  });

  it('should remove a favorite article', async () => {
    const res = await request(app)
      .delete(`/api/users/${testUserId}/favorites`)
      .send({ headline: 'News', source: 'Source' });
    expect(res.status).toBe(200);
    expect(res.body.savedArticles).toEqual([]);
  });

  it('should send forgot password email', async () => {
    const res = await request(app)
      .post('/api/users/forgot-password')
      .send({ email: 'john@example.com' });
    expect(res.status).toBe(200);
    expect(res.body.ForgotPassword).toBe('Success');
  });

  it('should delete user', async () => {
    const res = await request(app)
      .delete(`/api/users/delete/${testUserId}`);
    expect(res.status).toBe(200);
    expect(res.body.Delete).toBe('Success');
  });
});
