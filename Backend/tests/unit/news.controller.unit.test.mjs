// tests/unit/controller.test.js

import { jest } from '@jest/globals';
import mongoose from 'mongoose';
import { mockMongooseModel, mockNewsAPI } from '../utils/mockUtils.js';

// Silence noisy logs
jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});

describe('News Controller Unit Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchAndStoreNews', () => {
    it('should fetch and insert articles into MongoDB', async () => {
      const sourcesData = {
        sources: [
          { id: 'cnn', country: 'us' },
          { id: 'bbc-news', country: 'gb' },
        ],
      };
      const articlesData = {
        articles: [
          {
            source: { id: 'cnn', name: 'CNN' },
            title: 'Sample Headline',
            description: 'Sample Description',
            publishedAt: new Date().toISOString(),
          },
        ],
      };

      const mockApi = mockNewsAPI({ sourcesData, articlesData });

      jest.unstable_mockModule('newsapi', () => ({
        default: jest.fn(() => mockApi),
      }));

      mongoose.model = mockMongooseModel({
        deleteMany: jest.fn().mockResolvedValue({}),
        insertMany: jest.fn().mockResolvedValue({}),
      });

      const { fetchAndStoreNews } = await import('../../src/api/news/controller.js');
      await fetchAndStoreNews();

      expect(mongoose.model().deleteMany).toHaveBeenCalled();
      expect(mongoose.model().insertMany).toHaveBeenCalledWith(expect.any(Array), { ordered: false });
    });

    it('should handle errors in insertMany gracefully', async () => {
      const sourcesData = {
        sources: [{ id: 'cnn', country: 'us' }],
      };
      const articlesData = {
        articles: [
          {
            source: { id: 'cnn', name: 'CNN' },
            title: 'Headline',
            description: 'Desc',
            publishedAt: new Date().toISOString(),
          },
        ],
      };

      const mockApi = mockNewsAPI({ sourcesData, articlesData });

      jest.unstable_mockModule('newsapi', () => ({
        default: jest.fn(() => mockApi),
      }));

      mongoose.model = mockMongooseModel({
        deleteMany: jest.fn().mockResolvedValue({}),
        insertMany: jest.fn().mockRejectedValue(new Error('Insert failed')),
      });

      const { fetchAndStoreNews } = await import('../../src/api/news/controller.js');

      await expect(fetchAndStoreNews()).resolves.toBeUndefined();
      expect(console.error).toHaveBeenCalledWith('some docs failed to insert', expect.any(Error));
    });
  });

  describe('showDaily', () => {
    it('should return all articles', async () => {
      mongoose.model = mockMongooseModel({
        find: jest.fn().mockResolvedValue([{ headline: 'Test Article' }]),
      });

      const { showDaily } = await import('../../src/api/news/controller.js');
      const req = {};
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await showDaily(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([{ headline: 'Test Article' }]);
    });

    it('should return 500 on error', async () => {
      mongoose.model = mockMongooseModel({
        find: jest.fn().mockRejectedValue(new Error('DB Error')),
      });

      const { showDaily } = await import('../../src/api/news/controller.js');
      const req = {};
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await showDaily(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'DB Error' });
    });
  });

  describe('showFav', () => {
    it('should return favorited articles from dynamic collection', async () => {
      mongoose.model = mockMongooseModel({
        find: jest.fn().mockResolvedValue([{ favorite: true }]),
      });

      const { showFav } = await import('../../src/api/news/controller.js');
      const req = { id: 'test' };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await showFav(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([{ favorite: true }]);
    });

    it('should return 500 on query failure', async () => {
      mongoose.model = mockMongooseModel({
        find: jest.fn().mockRejectedValue(new Error('Collection Error')),
      });

      const { showFav } = await import('../../src/api/news/controller.js');
      const req = { id: 'bad-user' };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await showFav(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Collection Error' });
    });
  });

  describe('searchByCountry', () => {
    it('should return filtered articles by country', async () => {
      mongoose.model = mockMongooseModel({
        find: jest.fn().mockResolvedValue([{ country: 'us' }]),
      });

      const { searchByCountry } = await import('../../src/api/news/controller.js');
      const req = { params: { country: 'us' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await searchByCountry(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([{ country: 'us' }]);
    });

    it('should return 500 on find error', async () => {
      mongoose.model = mockMongooseModel({
        find: jest.fn().mockRejectedValue(new Error('Query Error')),
      });

      const { searchByCountry } = await import('../../src/api/news/controller.js');
      const req = { params: { country: 'bad' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await searchByCountry(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Query Error' });
    });
  });
});