const path = require('path');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 5000,
  setupFilesAfterEnv: ['./src/tests/setup.ts'],  // Changé pour correspondre à votre structure
  testMatch: ['**/src/tests/**/*.test.ts'],      // Changé aussi
  moduleDirectories: ['node_modules', 'src'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  }
};