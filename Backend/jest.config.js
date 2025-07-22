module.exports = {
  transform: {
    '^.+\\.m?[jt]sx?$': 'babel-jest',
  },
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleFileExtensions: ['js', 'mjs', 'json', 'node'],
  testMatch: [    "**/tests/**/*.test.js",
    "**/tests/**/*.test.mjs"],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.vscode/',
    '/TypeScriptStuff/',
  ],
};
