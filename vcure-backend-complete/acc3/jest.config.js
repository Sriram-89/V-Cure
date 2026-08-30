/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: 'src',
  testMatch: ['**/tests/**/*.spec.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: ['ai/**/*.ts', '!ai/**/*.spec.ts', '!ai/tests/**'],
  coverageDirectory: '../coverage',
  setupFilesAfterEnv: ['<rootDir>/ai/tests/jest.setup.ts'],
  clearMocks: true,
};
