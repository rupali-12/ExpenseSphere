// tests/setup.js
// This file runs before every test file
// Sets all required environment variables so no .env file is needed during testing

process.env.JWT_SECRET     = 'test-secret-key-for-jest-testing-only'
process.env.JWT_EXPIRES_IN = '30d'
process.env.MONGO_URI      = 'mongodb://localhost:27017/expense-tracker-test'
process.env.EMAIL_USER     = 'test@gmail.com'
process.env.EMAIL_PASS     = 'testapppassword'
process.env.PORT           = '5001'