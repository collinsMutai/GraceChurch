module.exports = {
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
  setupFiles: ['dotenv/config'], // Load environment variables from .env file
  testPathIgnorePatterns: ['/node_modules/', '/build/', '/dist/'], // Ignore build/dist directories
  moduleNameMapper: {
    '\\.js$': 'babel-jest', // Use babel-jest for JS files
    // Add more if you use TypeScript or other extensions
  },
  globals: {
    __DEV__: true, // Global variables, useful for tests
  },
  testTimeout: 10000, // Optional: Adjust test timeout as needed
};
