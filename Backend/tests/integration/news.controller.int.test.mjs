import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { jest } from '@jest/globals';
import nock from 'nock';
nock.disableNetConnect();
nock.enableNetConnect(/(127\.0\.0\.1|fastdl\.mongodb\.org)/);

import {
  fetchAndStoreNews,
  showDaily,
  searchByCountry,
  getCountryFromCoordinates
} from '../../src/api/news/controller.js';

import { dailyNewsSchema } from '../../src/Mongoose/schemas.js';

describe('News Controller Integration Tests', () => {
  let mongoServer;
  const DailyNews = mongoose.model('dailyNews', dailyNewsSchema, 'DailyNews');

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create({ binary: { skipMD5: true } });
    await mongoose.connect(mongoServer.getUri(), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterEach(async () => {
    if (mongoose.connection?.db) await mongoose.connection.db.dropDatabase();
    nock.cleanAll();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('should fetch news and insert into MongoDB', async () => {
    nock('https://newsapi.org')
      .get('/v2/sources')
      .query(true)
      .reply(200, { sources: [{ id: 'test', country: 'us' }] });

    nock('https://newsapi.org')
      .get('/v2/top-headlines')
      .query(true)
      .reply(200, {
        articles: [{
          source: { id: 'test', name: 'Test' },
          title: 'Sample Headline',
          description: 'Sample Description',
          publishedAt: new Date().toISOString(),
        }],
      });

    await fetchAndStoreNews();
    const count = await DailyNews.countDocuments();
    expect(count).toBeGreaterThan(0);
  }, 15000);

  it('should return all articles with showDaily()', async () => {
    await DailyNews.insertMany([
      { country: 'us', title: 'A', description: '...', publishedAt: new Date(), source: 'Test', favorite: false },
      { country: 'us', title: 'B', description: '...', publishedAt: new Date(), source: 'Test', favorite: true }
    ]);

    const req = {};
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await showDaily(req, res);

    const payload = res.json.mock.calls[0][0];
    expect(res.status).toHaveBeenCalledWith(200);
    expect(Array.isArray(payload)).toBe(true);
  });

  it('should return 500 in showDaily() on DB error', async () => {
    const modelSpy = jest.spyOn(mongoose, 'model').mockReturnValue({
      find: jest.fn().mockRejectedValue(new Error('DB Error')),
    });

    const req = {};
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await showDaily(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'DB Error' });

    modelSpy.mockRestore();
  });

  it('should return articles by country in searchByCountry()', async () => {
    await DailyNews.insertMany([
      { country: 'us', title: 'USA News', description: '', publishedAt: new Date(), source: 'CNN', favorite: false },
      { country: 'fr', title: 'France News', description: '', publishedAt: new Date(), source: 'BFM', favorite: false },
    ]);

    const req = { params: { country: 'us' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await searchByCountry(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([
      expect.objectContaining({ country: 'us' }),
    ]);
  });

  it('should return 500 in searchByCountry() on DB error', async () => {
    const modelSpy = jest.spyOn(mongoose, 'model').mockReturnValue({
      find: jest.fn().mockRejectedValue(new Error('Query Error')),
    });

    const req = { params: { country: 'us' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await searchByCountry(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Query Error' });

    modelSpy.mockRestore();
  });

  it('should return country from coordinates', async () => {
    nock('https://nominatim.openstreetmap.org')
      .get(/\/reverse/)
      .query(true)
      .reply(200, { address: { country: 'Mexico' } });

    const req = { params: { lat: '19.4326', lng: '-99.1332' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getCountryFromCoordinates(req, res);
    expect(res.json).toHaveBeenCalledWith({ country: 'Mexico' });
  });

  it('should return null when no country found', async () => {
    nock('https://nominatim.openstreetmap.org')
      .get(/\/reverse/)
      .query(true)
      .reply(200, {});

    const req = { params: { lat: '0', lng: '0' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getCountryFromCoordinates(req, res);
    expect(res.json).toHaveBeenCalledWith({ country: null });
  });

  it('should return 500 on reverse geocoding error', async () => {
    nock('https://nominatim.openstreetmap.org')
      .get(/\/reverse/)
      .query(true)
      .replyWithError('Request failed');

    const req = { params: { lat: '100', lng: '200' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getCountryFromCoordinates(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to get country' });
  });
});
