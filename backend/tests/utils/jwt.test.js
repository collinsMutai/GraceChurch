const { verifyGuestToken, generateToken } = require('../utils/jwt'); // Import your JWT utilities
const jwt = require('jsonwebtoken');
const request = require('supertest'); // Supertest to make HTTP requests to your Express app

jest.mock('jsonwebtoken');  // Mock the jwt module to control its behavior in tests

describe('JWT Utility Tests', () => {

  let app;  // Express app instance

  beforeAll(() => {
    // Assuming your app is set up in 'app.js' and the middleware is applied there
    app = require('../app');  // Import the app if it isn't already available

    // Mock jwt.verify to simulate token verification behavior
    jwt.verify.mockImplementation((token, secret, callback) => {
      if (token === "validToken") {
        return { id: 1, name: "John Doe" };  // Simulate a valid decoded token payload
      } else {
        throw new Error("Invalid or expired token");  // Simulate an error for invalid tokens
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();  // Clear mocks after each test to avoid test interference
  });

  // Test Case 1: Should successfully verify a valid guest token
  test('1. should verify a valid guest token and proceed', async () => {
    const token = generateToken({ id: 1, name: "John Doe" });  // Generate a valid token

    const response = await request(app)
      .get('/protected-endpoint')  // Assuming this endpoint uses the `verifyGuestToken` middleware
      .set('Authorization', `Bearer ${token}`)  // Send the token in the Authorization header
      .expect(200);  // Expect 200 OK

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Access granted');  // Check the success message
  });

  // Test Case 2: Should return 401 if no token is provided
  test('2. should return 401 if no token is provided', async () => {
    const response = await request(app)
      .get('/protected-endpoint')  // Request without token
      .expect(401);  // Expect 401 Unauthorized

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('No token provided');  // Check error message for missing token
  });

  // Test Case 3: Should return 403 for invalid or expired token
  test('3. should return 403 for invalid or expired token', async () => {
    const response = await request(app)
      .get('/protected-endpoint')
      .set('Authorization', 'Bearer invalidToken')  // Send an invalid token in the Authorization header
      .expect(403);  // Expect 403 Forbidden

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Invalid or expired token');  // Check error message for invalid token
  });

  // Test Case 4: Should generate a valid token and return a valid payload
  test('4. should generate a valid token and return a valid payload', async () => {
    const payload = { id: 1, name: 'John Doe' };  // Simulated payload
    const token = generateToken(payload);  // Generate a token using the generateToken function

    jwt.verify.mockImplementationOnce((token, secret, callback) => {  // Simulate a mock of jwt.verify
      if (token === 'validToken') return payload;  // Return the simulated payload for valid token
      throw new Error('Invalid token');
    });

    const decoded = jwt.verify(token, 'secret');  // Decode the token using the mock verify method

    expect(decoded).toEqual(payload);  // Ensure the decoded token matches the payload
  });

  // Test Case 5: Should return 403 if token verification fails
  test('5. should return 403 if token verification fails', async () => {
    const response = await request(app)
      .get('/protected-endpoint')
      .set('Authorization', 'Bearer invalidToken')  // Send an invalid token
      .expect(403);  // Expect 403 Forbidden

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Invalid or expired token');
  });

  // Test Case 6: Should return 401 if an expired token is used
  test('6. should return 401 if an expired token is used', async () => {
    jwt.verify.mockImplementationOnce((token, secret, callback) => {
      throw new Error('jwt expired');  // Simulate expired token error
    });

    const response = await request(app)
      .get('/protected-endpoint')
      .set('Authorization', 'Bearer expiredToken')  // Send an expired token
      .expect(401);  // Expect 401 Unauthorized

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Token expired');  // Check for the expired token message
  });

  // Test Case 7: Should return 200 if a valid token is provided and token payload matches
  test('7. should return 200 if a valid token is provided and token payload matches', async () => {
    const validToken = generateToken({ id: 2, name: 'Jane Doe' });  // Generate a valid token with different payload

    jwt.verify.mockImplementationOnce((token, secret, callback) => {
      if (token === validToken) return { id: 2, name: 'Jane Doe' };  // Return a valid decoded payload
      throw new Error('Invalid or expired token');
    });

    const response = await request(app)
      .get('/protected-endpoint')
      .set('Authorization', `Bearer ${validToken}`)  // Send valid token in header
      .expect(200);  // Expect 200 OK

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Access granted');
  });

});

