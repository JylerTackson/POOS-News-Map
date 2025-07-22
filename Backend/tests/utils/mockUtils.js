// tests/utils/mockUtils.js
export function mockNewsAPI({ sourcesData, articlesData }) {
  return {
    v2: {
      sources: jest.fn().mockResolvedValue(sourcesData),
      topHeadlines: jest.fn().mockResolvedValue(articlesData),
    },
  };
}

export function mockMongooseModel(overrides = {}) {
  return jest.fn(() => ({
    deleteMany: jest.fn().mockResolvedValue({}),
    insertMany: jest.fn().mockResolvedValue({}),
    find: jest.fn().mockResolvedValue([]),
    ...overrides,
  }));
}
