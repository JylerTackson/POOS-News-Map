import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { retrieveTeamInfo } from '../../src/api/team/controller.js';
import { teamSchema } from '../../src/Mongoose/schemas.js';

describe('Integration Test - retrieveTeamInfo', () => {
  let mongoServer;
  let TeamInfo;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create({ binary: { skipMD5: true } });
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    TeamInfo = mongoose.model('TeamInfo', teamSchema, 'TeamInfo');
  });

  afterEach(async () => {
    await mongoose.connection.db.dropDatabase();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('should return 200 and inserted team documents', async () => {
    await TeamInfo.insertMany([
      { name: 'Alice', role: 'Leader' },
      { name: 'Bob', role: 'Dev' },
    ]);

    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await retrieveTeamInfo(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json.mock.calls[0][0].length).toBe(2);
  });

  it('should return 500 if DB is inaccessible', async () => {
    await mongoose.disconnect(); // force failure

    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await retrieveTeamInfo(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }));

    // Reconnect for cleanup
    await mongoose.connect(mongoServer.getUri(), { useNewUrlParser: true, useUnifiedTopology: true });
  });
});
