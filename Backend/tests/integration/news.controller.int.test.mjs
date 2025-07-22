import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { jest } from '@jest/globals';
import nock from 'nock';

nock.disableNetConnect();
nock.enableNetConnect(/(127\.0\.0\.1|fastdl\.mongodb\.org)/); // ✅ allow localhost & MongoDB binary downloads

import {
  fetchAndStoreNews,
  showDaily,
  showFav,
  searchByCountry,
} from '../../src/api/news/controller.js';

import { dailyNewsSchema } from '../../src/Mongoose/schemas.js';

describe('News Controller Integration Tests', () => {
  let mongoServer;
  const DailyNews = mongoose.model('dailyNews', dailyNewsSchema, 'DailyNews'); // ✅ match controller

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

  it('should handle error if insertMany fails in fetchAndStoreNews', async () => {
    const sourcesData = { sources: [{ id: 'test', country: 'us' }] };
    const articlesData = {
      articles: [{
        source: { id: 'test', name: 'Test' },
        title: 'Error Headline',
        description: 'Desc',
        publishedAt: new Date().toISOString(),
      }],
    };

    nock('https://newsapi.org').get('/v2/sources').query(true).reply(200, sourcesData);
    nock('https://newsapi.org').get('/v2/top-headlines').query(true).reply(200, articlesData);

    const modelSpy = jest.spyOn(mongoose, 'model').mockReturnValue({
      deleteMany: jest.fn().mockResolvedValue({}),
      insertMany: jest.fn().mockRejectedValue(new Error('insert failed')),
    });
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(fetchAndStoreNews()).resolves.toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith('some docs failed to insert', expect.any(Error));

    modelSpy.mockRestore();
    consoleSpy.mockRestore();
  });

it('should return all articles with showDaily()', async () => {
  // Clear DB
  await DailyNews.deleteMany({});

  // Insert two test articles
  await DailyNews.insertMany([
    {
      country: 'us',
      title: 'Test A',
      description: '...',
      publishedAt: new Date(),
      source: 'Test',
      favorite: false,
    },
    {
      country: 'us',
      title: 'Test B',
      description: '...',
      publishedAt: new Date(),
      source: 'Test',
      favorite: true,
    },
  ]);

  // Mock request/response
  const req = {};
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  // Call controller
  await showDaily(req, res);

  // Extract payload
  const payload = res.json.mock.calls[0][0];
  console.log('🔍 Payload:', JSON.stringify(payload, null, 2)); // For debugging

  // Assertions
  expect(res.status).toHaveBeenCalledWith(200);
  expect(Array.isArray(payload)).toBe(true);

  const titles = payload.map(article => article.title);
  expect(titles).toEqual(expect.arrayContaining(['Test A', 'Test B']));
});



  it('should handle error in showDaily()', async () => {
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

  it('should return only favorited articles for showFav()', async () => {
    await DailyNews.insertMany([
      { country: 'us', title: 'Liked', description: '', publishedAt: new Date(), source: 'Test', favorite: true },
      { country: 'us', title: 'Unliked', description: '', publishedAt: new Date(), source: 'Test', favorite: false },
    ]);

    const req = { id: 'DailyNews' }; // ✅ collection name used by showFav
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    await showFav(req, res);

    const payload = res.json.mock.calls[0][0];
    expect(res.status).toHaveBeenCalledWith(200);
    expect(payload).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ favorite: true }),
      ])
    );
  });

  it('should return 500 in showFav() if DB error occurs', async () => {
    const modelSpy = jest.spyOn(mongoose, 'model').mockReturnValue({
      find: jest.fn().mockRejectedValue(new Error('Fav DB Error')),
    });

    const req = { id: 'test' };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await showFav(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Fav DB Error' });

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

  it('should return 500 in searchByCountry() if DB error occurs', async () => {
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

  it('should return an empty array when no country matches', async () => {
    const req = { params: { country: 'zz' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    await searchByCountry(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([]);
  });
});
