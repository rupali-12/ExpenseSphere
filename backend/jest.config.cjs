module.exports = {
  testEnvironment: 'node',

  transform: {
    '^.+\\.js$': 'babel-jest',
  },

  testMatch: ['**/tests/**/*.test.js'],

  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  collectCoverage: true,

  collectCoverageFrom: [
    'controllers/**/*.js',
    'middlewares/**/*.js',
    'models/**/*.js',
    'utils/**/*.js',

    '!tests/**',
    '!config/**',
    '!server.js'
  ],

  coverageReporters: ['text', 'text-summary', 'html'],

  coverageThreshold: {
    global: {
      statements: 70,
      branches: 60,
      functions: 70,
      lines: 70,
    },
  },

  clearMocks: true,
  restoreMocks: true,
  verbose: true,
}