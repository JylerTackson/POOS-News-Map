// tests/unit/users.controller.unit.test.js

// 1) Stub out Mongoose schemas so `new Schema()` never runs
jest.mock('../../src/Mongoose/schemas.js', () => ({ userSchema: {} }));

// 2) Mock Mongoose model methods
const mockModel = {
  findOne: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
};
jest.mock('mongoose', () => ({
  model: jest.fn(() => mockModel),
}));

// 3) Mock bcryptjs
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

// 4) Mock SendGrid mail inline (no out‑of‑scope variable)
jest.mock('@sendgrid/mail', () => ({
  setApiKey: jest.fn(),
  send: jest.fn(),
}));
const sgMail = require('@sendgrid/mail');

// 5) Mock crypto.randomBytes
jest.mock('crypto', () => ({
  randomBytes: jest.fn().mockReturnValue(Buffer.from('cafebabe', 'hex')),
}));

// 6) Import the controller functions under test
const {
  register,
  login,
  getUser,
  updateUser,
  deleteUser,
  verifyEmail,
  forgotPassword,
  addFavorite,
  removeFavorite,
} = require('../../src/api/users/controller');

describe('User Controller (unit)', () => {
  let req, res;
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...OLD_ENV,
      FRONTEND_URL: 'http://app.test',
      EMAIL_FROM: 'noreply@test',
    };
    req = { body: {}, params: {}, query: {}, id: 'UID' };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  // --------------------
  // register()
  // --------------------
  describe('register()', () => {
    it('400 if missing fields', async () => {
      await register(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        Registration: 'Failure',
        Error: 'All Schema information required',
      });
    });

    it('409 if user already exists', async () => {
      req.body = { firstName: 'A', lastName: 'B', email: 'a@b.com', password: 'pw' };
      mockModel.findOne.mockResolvedValue({});
      await register(req, res);
      expect(mockModel.findOne).toHaveBeenCalledWith({ email: 'a@b.com' });
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        Registration: 'Failure',
        Error: 'User already exists',
      });
    });

    it('201 and sends verification email on success', async () => {
      req.body = { firstName: 'A', lastName: 'B', email: 'a@b.com', password: 'pw' };
      mockModel.findOne.mockResolvedValue(null);
      require('bcryptjs').hash.mockResolvedValue('HASHED');
      mockModel.create.mockResolvedValue({
        _id: 'XYZ',
        firstName: 'A',
        lastName: 'B',
        email: 'a@b.com',
      });

      await register(req, res);

      expect(require('bcryptjs').hash).toHaveBeenCalledWith('pw', 10);
      expect(require('crypto').randomBytes).toHaveBeenCalledWith(32);
      expect(mockModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'A',
          lastName: 'B',
          email: 'a@b.com',
          password: 'HASHED',
          isVerified: false,
          verifyToken: expect.any(String),
          verifyTokenExpires: expect.any(Number),
        })
      );
      expect(sgMail.send).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        Registration: 'Success',
        _id: 'XYZ',
        firstName: 'A',
        lastName: 'B',
        email: 'a@b.com',
        message: 'Please check your email to verify your account',
      });
    });

    it('500 if bcrypt.hash throws', async () => {
      req.body = { firstName: 'A', lastName: 'B', email: 'a@b.com', password: 'pw' };
      mockModel.findOne.mockResolvedValue(null);
      require('bcryptjs').hash.mockRejectedValue(new Error('oops'));
      await register(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        Registration: 'Failure',
        Error: 'oops',
      });
    });
  });

  // --------------------
  // login()
  // --------------------
  describe('login()', () => {
    it('400 if missing credentials', async () => {
      await login(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        Login: 'Failure',
        Error: 'Both Email and Password are required',
      });
    });

    it('401 if user not found', async () => {
      req.body = { email: 'x@y.com', password: 'pw' };
      mockModel.findOne.mockResolvedValue(null);
      await login(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        Login: 'Failure',
        Error: 'Invalid email or password',
      });
    });

    it('403 if user not verified', async () => {
      req.body = { email: 'x@y.com', password: 'pw' };
      mockModel.findOne.mockResolvedValue({ isVerified: false, password: 'hash' });
      await login(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        Login: 'Failure',
        Error: 'Please verify your email before logging in',
      });
    });

    it('401 if password invalid', async () => {
      req.body = { email: 'x@y.com', password: 'pw' };
      mockModel.findOne.mockResolvedValue({ isVerified: true, password: 'hash' });
      require('bcryptjs').compare.mockResolvedValue(false);
      await login(req, res);
      expect(require('bcryptjs').compare).toHaveBeenCalledWith('pw', 'hash');
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        Login: 'Failure',
        Error: 'Invalid email or password',
      });
    });

    it('201 on valid login', async () => {
      const user = {
        _id: '1',
        firstName: 'A',
        lastName: 'B',
        email: 'x@y.com',
        avatarUrl: 'url',
        password: 'hash',
        isVerified: true,
      };
      req.body = { email: 'x@y.com', password: 'pw' };
      mockModel.findOne.mockResolvedValue(user);
      require('bcryptjs').compare.mockResolvedValue(true);

      await login(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        Login: 'Success',
        _id: '1',
        firstName: 'A',
        lastName: 'B',
        email: 'x@y.com',
        avatarUrl: 'url',
      });
    });

    it('500 if findOne throws', async () => {
      req.body = { email: 'x@y.com', password: 'pw' };
      mockModel.findOne.mockRejectedValue(new Error('fail'));
      await login(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        Login: 'Failure',
        Error: 'fail',
      });
    });
  });

  // --------------------
  // getUser()
  // --------------------
  describe('getUser()', () => {
    it('201 if user found', async () => {
      req.params.email = 'u@u.com';
      mockModel.findOne.mockResolvedValue({
        _id: 'ID',
        firstName: 'A',
        lastName: 'B',
        email: 'u@u.com',
        avatarUrl: 'url',
        savedArticles: [1, 2],
      });
      await getUser(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        _id: 'ID',
        firstName: 'A',
        lastName: 'B',
        email: 'u@u.com',
        avatarUrl: 'url',
        savedArticles: [1, 2],
      });
    });

    it('404 if not found', async () => {
      req.params.email = 'u@u.com';
      mockModel.findOne.mockResolvedValue(null);
      await getUser(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'User Not Found',
      });
    });

    it('500 on error', async () => {
      mockModel.findOne.mockRejectedValue(new Error('err'));
      await getUser(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: { err: new Error('err') },
      });
    });
  });

  // --------------------
  // updateUser()
  // --------------------
  describe('updateUser()', () => {
    beforeEach(() => {
      req.params.id = 'UID';
    });

    it('409 if new email in use', async () => {
      req.body = { email: 'taken@test.com' };
      mockModel.findOne.mockResolvedValue({});
      await updateUser(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        Update: 'Failure',
        Error: 'Email already in use',
      });
    });

    it('404 if user not found', async () => {
      req.body = { firstName: 'X' };
      mockModel.findOne.mockResolvedValue(null);
      mockModel.findByIdAndUpdate.mockResolvedValue(null);
      await updateUser(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        Update: 'Failure',
        Error: 'User not found',
      });
    });

    it('200 on success', async () => {
      const updated = {
        _id: 'UID',
        firstName: 'X',
        lastName: 'Y',
        email: 'e@test',
        avatarUrl: 'u',
      };
      req.body = { firstName: 'X' };
      mockModel.findOne.mockResolvedValue(null);
      mockModel.findByIdAndUpdate.mockResolvedValue(updated);

      await updateUser(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        Update: 'Success',
        user: updated,
      });
    });

    it('500 on error', async () => {
      req.body = { firstName: 'X' };
      mockModel.findOne.mockResolvedValue(null);
      mockModel.findByIdAndUpdate.mockRejectedValue(new Error('fail'));
      await updateUser(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        Update: 'Failure',
        Error: 'fail',
      });
    });
  });

  // --------------------
  // deleteUser()
  // --------------------
  describe('deleteUser()', () => {
    beforeEach(() => {
      req.params.id = 'UID';
    });

    it('404 if user not found', async () => {
      mockModel.findByIdAndDelete.mockResolvedValue(null);
      await deleteUser(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        Delete: 'Failure',
        Error: 'User not found',
      });
    });

    it('200 on success', async () => {
      mockModel.findByIdAndDelete.mockResolvedValue({
        _id: 'UID',
        firstName: 'A',
        lastName: 'B',
        email: 'e@e.com',
      });
      await deleteUser(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        Delete: 'Success',
        message: 'User deleted successfully',
        deletedUser: {
          _id: 'UID',
          firstName: 'A',
          lastName: 'B',
          email: 'e@e.com',
        },
      });
    });

    it('500 on error', async () => {
      mockModel.findByIdAndDelete.mockRejectedValue(new Error('fail'));
      await deleteUser(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        Delete: 'Failure',
        Error: 'fail',
      });
    });
  });

  // --------------------
  // verifyEmail()
  // --------------------
  describe('verifyEmail()', () => {
    beforeEach(() => {
      req.query = { token: 'tok', id: 'UID' };
    });

    it('400 if invalid/expired token', async () => {
      mockModel.findOne.mockResolvedValue(null);
      await verifyEmail(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        verified: 'failure',
        error: 'Invalid or expired token.',
      });
    });

    it('200 on success', async () => {
      const user = {
        isVerified: false,
        verifyToken: 'tok',
        verifyTokenExpires: Date.now() + 1000,
        save: jest.fn(),
        _id: 'UID',
        firstName: 'A',
        lastName: 'B',
        email: 'e@e.com',
      };
      mockModel.findOne.mockResolvedValue(user);

      await verifyEmail(req, res);

      expect(user.isVerified).toBe(true);
      expect(user.verifyToken).toBeUndefined();
      expect(user.verifyTokenExpires).toBeUndefined();
      expect(user.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        verified: 'success',
        user: {
          _id: 'UID',
          firstName: 'A',
          lastName: 'B',
          email: 'e@e.com',
          isVerified: true,
        },
      });
    });

    it('500 on error', async () => {
      mockModel.findOne.mockRejectedValue(new Error('fail'));
      await verifyEmail(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        verified: 'failure',
        error: 'fail',
      });
    });
  });

  // --------------------
  // forgotPassword()
  // --------------------
  describe('forgotPassword()', () => {
    it('400 if no email', async () => {
      await forgotPassword(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        ForgotPassword: 'Failure',
        Error: 'Email is required',
      });
    });

    it('200 even if user not found', async () => {
      req.body.email = 'x@y.com';
      mockModel.findOne.mockResolvedValue(null);
      await forgotPassword(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        ForgotPassword: 'Success',
        message: 'If an account exists, a temporary password has been sent',
      });
    });

    it('200 and sends temp password on success', async () => {
      req.body.email = 'x@y.com';
      const user = { _id: 'UID', firstName: 'A', email: 'x@y.com' };
      mockModel.findOne.mockResolvedValue(user);
      require('bcryptjs').hash.mockResolvedValue('temphash');
      mockModel.findByIdAndUpdate.mockResolvedValue({});

      await forgotPassword(req, res);

      expect(require('bcryptjs').hash).toHaveBeenCalled();
      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith('UID', { password: 'temphash' });
      expect(sgMail.send).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        ForgotPassword: 'Success',
        message: 'Temporary password sent to email',
      });
    });

    it('500 on error', async () => {
      req.body.email = 'x@y.com';
      mockModel.findOne.mockRejectedValue(new Error('fail'));
      await forgotPassword(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        ForgotPassword: 'Failure',
        Error: 'Failed to process password reset',
      });
    });
  });

  // --------------------
  // addFavorite()
  // --------------------
  describe('addFavorite()', () => {
    beforeEach(() => {
      req.params.id = 'UID';
    });

    it('404 if user not found', async () => {
      mockModel.findByIdAndUpdate.mockResolvedValue(null);
      req.body = { headline: 'h', source: 's' };
      await addFavorite(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('200 on success', async () => {
      const user = { savedArticles: [{ a: 1 }] };
      mockModel.findByIdAndUpdate.mockResolvedValue(user);
      req.body = { headline: 'h', source: 's' };
      await addFavorite(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Article favorited',
        savedArticles: user.savedArticles,
      });
    });

    it('500 on error', async () => {
      mockModel.findByIdAndUpdate.mockRejectedValue(new Error('fail'));
      req.body = { headline: 'h', source: 's' };
      await addFavorite(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'fail' });
    });
  });

  // --------------------
  // removeFavorite()
  // --------------------
  describe('removeFavorite()', () => {
    beforeEach(() => {
      req.params.id = 'UID';
    });

    it('404 if user not found', async () => {
      mockModel.findByIdAndUpdate.mockResolvedValue(null);
      req.body = { headline: 'h', source: 's' };
      await removeFavorite(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('200 on success', async () => {
      const user = { savedArticles: [] };
      mockModel.findByIdAndUpdate.mockResolvedValue(user);
      req.body = { headline: 'h', source: 's' };
      await removeFavorite(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Article unfavorited',
        savedArticles: user.savedArticles,
      });
    });

    it('500 on error', async () => {
      mockModel.findByIdAndUpdate.mockRejectedValue(new Error('fail'));
      req.body = { headline: 'h', source: 's' };
      await removeFavorite(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'fail' });
    });
  });
});
