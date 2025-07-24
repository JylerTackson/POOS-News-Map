// Frontend/jest.config.cjs
module.exports = {
  // 1) Use babel-jest to strip TS/JS and JSX/TSX
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },

  // 2) Run tests in a browser‑like environment
  testEnvironment: 'jest-environment-jsdom',

  // 3) Resolve these extensions
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],

  // 4) Look for any *.test.* or *.spec.* under src/
  testMatch: ['<rootDir>/src/**/*.(test|spec).{js,jsx,ts,tsx}'],

  // 5) Stub out static asset imports
  moduleNameMapper: {
    '\\.(css|png|jpg|jpeg|svg)$': '<rootDir>/fileMock.js',

     // Handle `@/` -> `src/` alias used in your code
    '^@/(.*)$': '<rootDir>/src/$1',
  },

   setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs']
};
