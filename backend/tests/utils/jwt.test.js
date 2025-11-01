const { verifyGuestToken, generateToken } = require('../../utils/jwt'); // Import JWT utilities
const jwt = require('jsonwebtoken');
const request = require('supertest'); // Supertest for HTTP requests
const sinon = require('sinon');
const chai = require('chai');
const expect = chai.expect;

describe('JWT Utility Tests', () => {
  let app; // Express app instance
  let jwtVerifyStub;

  before(() => {
    // Assuming your app is set up in 'app.js'
    app = require('../server');  // Import the app if it isn't already available

    // Mock jwt.verify to simulate token verification behavior
    jwtVerifyStub = sinon.stub(jwt, 'verify');
  });

  afterEach(() => {
    // Clear mocks after each test
    jwtVerifyStub.resetHistory();
  });

  after(() => {
    // Restore original jwt.verify after all tests are finished
    jwtVerifyStub.restore();
  });

  // Test Case 1: Should successfully verify a valid guest token
  it('should verify a valid guest token and proceed', async () => {
    const token = generateToken({ id: 1, name: 'John Doe' }); // Generate a valid token

    jwtVerifyStub.callsFake((token, secret, callback) => {
      if (token === 'validToken') {
        return { id: 1, name: 'John Doe' };  // Simulate a valid decoded token payload
      } else {
        throw new Error('Invalid or expired token');  // Simulate an error for invalid tokens
      }
    });

    const response = await request(app)
      .get('/protected-endpoint')  // Assuming this endpoint uses the `verifyGuestToken` middleware
      .set('Authorization', `Bearer ${token}`)  // Send the token in the Authorization header
      .expect(200);  // Expect 200 OK

    expect(response.body.success).to.equal(true);
    expect(response.body.message).to.equal('Access granted');  // Check the success message
  });

  // Test Case 2: Should return 401 if no token is provided
  it('should return 401 if no token is provided', async () => {
    const response = await request(app)
      .get('/protected-endpoint')  // Request without token
      .expect(401);  // Expect 401 Unauthorized

    expect(response.body.success).to.equal(false);
    expect(response.body.message).to.equal('No token provided');  // Check error message for missing token
  });

  // Test Case 3: Should return 403 for invalid or expired token
  it('should return 403 for invalid or expired token', async () => {
    jwtVerifyStub.callsFake((token, secret, callback) => {
      if (token === 'validToken') {
        return { id: 1, name: 'John Doe' };
      }
      throw new Error('Invalid or expired token');
    });

    const response = await request(app)
      .get('/protected-endpoint')
      .set('Authorization', 'Bearer invalidToken')  // Send an invalid token in the Authorization header
      .expect(403);  // Expect 403 Forbidden

    expect(response.body.success).to.equal(false);
    expect(response.body.message).to.equal('Invalid or expired token');  // Check error message for invalid token
  });

  // Test Case 4: Should generate a valid token and return a valid payload
  it('should generate a valid token and return a valid payload', async () => {
    const payload = { id: 1, name: 'John Doe' };  // Simulated payload
    const token = generateToken(payload);  // Generate a token using the generateToken function

    jwtVerifyStub.callsFake((token, secret, callback) => {  // Simulate a mock of jwt.verify
      if (token === 'validToken') return payload;  // Return the simulated payload for valid token
      throw new Error('Invalid token');
    });

    const decoded = jwt.verify(token, 'secret');  // Decode the token using the mock verify method

    expect(decoded).to.deep.equal(payload);  // Ensure the decoded token matches the payload
  });

  // Test Case 5: Should return 403 if token verification fails
  it('should return 403 if token verification fails', async () => {
    jwtVerifyStub.callsFake((token, secret, callback) => {
      throw new Error('Invalid or expired token');
    });

    const response = await request(app)
      .get('/protected-endpoint')
      .set('Authorization', 'Bearer invalidToken')  // Send an invalid token
      .expect(403);  // Expect 403 Forbidden

    expect(response.body.success).to.equal(false);
    expect(response.body.message).to.equal('Invalid or expired token');
  });

  // Test Case 6: Should return 401 if an expired token is used
  it('should return 401 if an expired token is used', async () => {
    jwtVerifyStub.callsFake((token, secret, callback) => {
      throw new Error('jwt expired');  // Simulate expired token error
    });

    const response = await request(app)
      .get('/protected-endpoint')
      .set('Authorization', 'Bearer expiredToken')  // Send an expired token
      .expect(401);  // Expect 401 Unauthorized

    expect(response.body.success).to.equal(false);
    expect(response.body.message).to.equal('Token expired');  // Check for the expired token message
  });

  // Test Case 7: Should return 200 if a valid token is provided and token payload matches
  it('should return 200 if a valid token is provided and token payload matches', async () => {
    const validToken = generateToken({ id: 2, name: 'Jane Doe' });  // Generate a valid token with different payload

    jwtVerifyStub.callsFake((token, secret, callback) => {
      if (token === validToken) return { id: 2, name: 'Jane Doe' };  // Return a valid decoded payload
      throw new Error('Invalid or expired token');
    });

    const response = await request(app)
      .get('/protected-endpoint')
      .set('Authorization', `Bearer ${validToken}`)  // Send valid token in header
      .expect(200);  // Expect 200 OK

    expect(response.body.success).to.equal(true);
    expect(response.body.message).to.equal('Access granted');
  });
});
