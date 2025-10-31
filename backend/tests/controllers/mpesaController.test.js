const request = require('supertest');  // Supertest is used to make HTTP requests to the server in tests
const server = require('../../server');  // Import the Express app from server.js (the app being tested)
const { initiateStkPush } = require('../../services/mpesaService');  // Mock service functions
const MpesaTransaction = require('../../models/MpesaTransaction');  // Mock the MpesaTransaction model

jest.mock('../../services/mpesaService');  // Mock the Mpesa service functions
jest.mock('../../models/MpesaTransaction');  // Mock the MpesaTransaction model to avoid actual DB interactions

describe('Mpesa Controller', () => {

  // Tests for the STK Push route (POST /api/mpesa/stkpush)
  describe('POST /api/mpesa/stkpush', () => {

    // Test Case 1: Returns error if phone is missing
    test('1. Returns error if phone is missing', async () => {
      const response = await request(server)
        .post('/api/mpesa/stkpush')
        .send({ amount: 1000 })  // Missing phone number
        .expect(400);  // Expect a 400 Bad Request

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Phone number is required');
    });

    // Test Case 2: Returns error if amount is missing
    test('2. Returns error if amount is missing', async () => {
      const response = await request(server)
        .post('/api/mpesa/stkpush')
        .send({ phone: '+254712345678' })  // Missing amount
        .expect(400);  // Expect a 400 Bad Request

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Amount is required');
    });

    // Test Case 3: Returns error if amount is invalid (negative or zero)
    test('3. Returns error if amount is invalid (negative or zero)', async () => {
      const response = await request(server)
        .post('/api/mpesa/stkpush')
        .send({ phone: '+254712345678', amount: -1000 })  // Negative amount
        .expect(400);  // Expect a 400 Bad Request

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Amount must be a positive value');
    });

    // Test Case 4: Returns error if phone format is invalid
    test('4. Returns error if phone format is invalid', async () => {
      const response = await request(server)
        .post('/api/mpesa/stkpush')
        .send({ phone: 'invalidPhoneNumber', amount: 1000 })  // Invalid phone format
        .expect(400);  // Expect a 400 Bad Request

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid phone number format');
    });

    // Test Case 5: Returns error if M-Pesa service fails
    test('5. Returns error if M-Pesa service fails', async () => {
      initiateStkPush.mockRejectedValue(new Error('M-Pesa API failed'));  // Simulate a service failure

      const response = await request(server)
        .post('/api/mpesa/stkpush')
        .send({ phone: '+254712345678', amount: 1000 })
        .expect(500);  // Expect a 500 Internal Server Error

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('STK Push failed. Please try again.');
    });

    // Test Case 6: Successfully initiates STK Push
    test('6. Successfully initiates STK Push', async () => {
      initiateStkPush.mockResolvedValue({ CheckoutRequestID: 'mockCheckoutID', CustomerMessage: 'Payment successful' });

      const response = await request(server)
        .post('/api/mpesa/stkpush')
        .send({ phone: '+254712345678', amount: 1000 })
        .expect(200);  // Expect a 200 OK

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Payment successful');
      expect(response.body.checkoutRequestID).toBe('mockCheckoutID');
    });

    // Test Case 7: Returns error if transaction limit exceeded
    test('7. Returns error if transaction limit exceeded', async () => {
      const maxLimit = 1000000;  // Define a hypothetical max limit
      const response = await request(server)
        .post('/api/mpesa/stkpush')
        .send({ phone: '+254712345678', amount: maxLimit + 1 })  // Amount exceeds limit
        .expect(400);  // Expect a 400 Bad Request

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Amount exceeds the allowed transaction limit');
    });

  });

  // Tests for the Callback route (POST /api/mpesa/callback)
  describe('POST /api/mpesa/callback', () => {

    // Test Case 8: Returns error if callback payload is invalid
    test('8. Returns error if callback payload is invalid', async () => {
      const response = await request(server)
        .post('/api/mpesa/callback')
        .send({ Body: {} })  // Empty callback data
        .expect(400);  // Expect a 400 Bad Request

      expect(response.body.message).toBe('Invalid callback structure');
    });

    // Test Case 9: Returns error if callback is missing necessary fields
    test('9. Returns error if callback is missing necessary fields (CheckoutRequestID, ResultCode, ResultDesc)', async () => {
      const response = await request(server)
        .post('/api/mpesa/callback')
        .send({ Body: { stkCallback: { ResultCode: 0 } } })  // Missing CheckoutRequestID and ResultDesc
        .expect(400);  // Expect a 400 Bad Request

      expect(response.body.message).toBe('Missing required callback fields');
    });

    // Test Case 10: Returns success if callback is processed successfully
    test('10. Returns success if callback is processed successfully', async () => {
      const callbackData = {
        CheckoutRequestID: 'mockCheckoutID',
        ResultCode: 0,
        ResultDesc: 'Payment successful',
      };

      const mockTransaction = {
        checkoutRequestID: 'mockCheckoutID',
        callbackReceived: false,
        save: jest.fn().mockResolvedValue(),
      };

      MpesaTransaction.findOne = jest.fn().mockResolvedValue(mockTransaction);
      const response = await request(server)
        .post('/api/mpesa/callback')
        .send({ Body: { stkCallback: callbackData } })
        .expect(200);  // Expect a 200 OK

      expect(response.body.message).toBe('Callback received successfully');
    });

    // Test Case 11: Returns error if callback is received after transaction completion
    test('11. Returns error if callback is received after transaction completion', async () => {
      const callbackData = {
        CheckoutRequestID: 'mockCheckoutID',
        ResultCode: 0,
        ResultDesc: 'Payment successful',
      };

      const mockTransaction = {
        checkoutRequestID: 'mockCheckoutID',
        callbackReceived: true,  // Simulate that the callback has already been processed
        save: jest.fn().mockResolvedValue(),
      };

      MpesaTransaction.findOne = jest.fn().mockResolvedValue(mockTransaction);
      const response = await request(server)
        .post('/api/mpesa/callback')
        .send({ Body: { stkCallback: callbackData } })
        .expect(400);  // Expect a 400 Bad Request

      expect(response.body.message).toBe('Callback already processed for this transaction');
    });

  });

  // Tests for the Transaction Status route (GET /api/mpesa/status/:checkoutId)
  describe('GET /api/mpesa/status/:checkoutId', () => {

    // Test Case 12: Returns error if transaction not found
    test('12. Returns error if transaction not found', async () => {
      MpesaTransaction.findOne = jest.fn().mockResolvedValue(null);  // Simulate no transaction found

      const response = await request(server)
        .get('/api/mpesa/status/nonExistentCheckoutID')
        .expect(404);  // Expect a 404 Not Found

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('No transaction found');
    });

    // Test Case 13: Returns transaction status if found
    test('13. Returns transaction status if found', async () => {
      const mockTransaction = {
        checkoutRequestID: 'mockCheckoutID',
        status: 'success',
        amount: 1000,
      };

      MpesaTransaction.findOne = jest.fn().mockResolvedValue(mockTransaction);  // Simulate transaction found

      const response = await request(server)
        .get('/api/mpesa/status/mockCheckoutID')
        .expect(200);  // Expect a 200 OK

      expect(response.body.success).toBe(true);
      expect(response.body.status).toBe('success');
      expect(response.body.amount).toBe(1000);  // Include amount in the response
    });

  });

});
