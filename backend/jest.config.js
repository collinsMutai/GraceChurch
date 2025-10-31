module.exports = {
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: 'coverage',
  setupFiles: ['dotenv/config'], // Load environment variables from .env file
  testPathIgnorePatterns: ['/node_modules/', '/build/'],
  moduleNameMapper: {
    // If you're using ES modules, map extensions
    '\\.js$': 'babel-jest',
  },
  globals: {
    // Jest global variables if needed (e.g., for ES modules or database connection)
    __DEV__: true,
  },
};
