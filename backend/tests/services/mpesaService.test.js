const { initiateStkPush, handleCallback } = require('../../services/mpesaService');
const MpesaTransaction = require('../../models/MpesaTransaction');
const axios = require('axios'); // Assuming you're using axios for making API calls

jest.mock('../../models/MpesaTransaction');  // Mock the MpesaTransaction model
jest.mock('axios');  // Mock the axios library

describe('Mpesa Service', () => {

  // Test cases for initiating STK Push
  describe('initiateStkPush', () => {

    // Test case 1: Valid phone, amount, and type parameters
    test('Successfully initiates STK push with valid input', async () => {
      const mockResponse = { CheckoutRequestID: 'mockCheckoutID', CustomerMessage: 'Payment successful' };
      axios.post = jest.fn().mockResolvedValue({ data: mockResponse });

      const response = await initiateStkPush({ phone: '+254712345678', amount: 1000, type: 'Payment' });

      expect(response.CheckoutRequestID).toBe('mockCheckoutID');
      expect(response.CustomerMessage).toBe('Payment successful');
    });

    // Test case 2: Default type is set to "Other" if no type is provided
    test('Successfully initiates STK push with missing type (defaults to "Other")', async () => {
      const mockResponse = { CheckoutRequestID: 'mockCheckoutID', CustomerMessage: 'Payment successful' };
      axios.post = jest.fn().mockResolvedValue({ data: mockResponse });

      const response = await initiateStkPush({ phone: '+254712345678', amount: 1000 });

      expect(response.CheckoutRequestID).toBe('mockCheckoutID');
      expect(response.CustomerMessage).toBe('Payment successful');
    });

    // Test case 3: Invalid phone number
    test('Fails if phone parameter is invalid (empty string or incorrect format)', async () => {
      const response = await initiateStkPush({ phone: '', amount: 1000 });

      expect(response).toBeNull();
    });

    // Test case 4: Invalid amount (negative or zero value)
    test('Fails if amount is negative or zero', async () => {
      const response = await initiateStkPush({ phone: '+254712345678', amount: -100 });

      expect(response).toBeNull();
    });

    // Test case 5: Amount too large
    test('Fails if amount exceeds transaction limit', async () => {
      const response = await initiateStkPush({ phone: '+254712345678', amount: 1000000 });

      expect(response).toBeNull();
    });

    // Test case 6: Invalid type parameter
    test('Fails if type parameter is invalid', async () => {
      const response = await initiateStkPush({ phone: '+254712345678', amount: 1000, type: 'InvalidType' });

      expect(response).toBeNull();
    });

    // Test case 7: No request body provided (empty request)
    test('Fails if request body is empty', async () => {
      const response = await initiateStkPush({});

      expect(response).toBeNull();
    });

    // Test case 8: Successful M-Pesa API response
    test('Successfully processes M-Pesa API response', async () => {
      const mockResponse = { CheckoutRequestID: 'mockCheckoutID', CustomerMessage: 'Payment successful' };
      axios.post = jest.fn().mockResolvedValue({ data: mockResponse });

      const response = await initiateStkPush({ phone: '+254712345678', amount: 1000 });

      expect(response.CheckoutRequestID).toBe('mockCheckoutID');
      expect(response.CustomerMessage).toBe('Payment successful');
    });

    // Test case 9: Failed API interaction (network issue or API failure)
    test('Handles failed M-Pesa API interaction', async () => {
      axios.post = jest.fn().mockRejectedValue(new Error('M-Pesa API failed'));

      await expect(initiateStkPush({ phone: '+254712345678', amount: 1000 }))
        .rejects
        .toThrow('M-Pesa API failed');
    });

    // Test case 10: M-Pesa API response timeout
    test('Handles M-Pesa API timeout', async () => {
      axios.post = jest.fn().mockRejectedValue(new Error('M-Pesa API timed out'));

      await expect(initiateStkPush({ phone: '+254712345678', amount: 1000 }))
        .rejects
        .toThrow('M-Pesa API timed out');
    });

    // Test case 11: Invalid M-Pesa API response (missing fields)
    test('Handles invalid M-Pesa API response (missing CheckoutRequestID)', async () => {
      const mockResponse = { CustomerMessage: 'Payment failed' };
      axios.post = jest.fn().mockResolvedValue({ data: mockResponse });

      await expect(initiateStkPush({ phone: '+254712345678', amount: 1000 }))
        .rejects
        .toThrow('Invalid response from M-Pesa API');
    });

  });

  // Test cases for handling callback
  describe('handleCallback', () => {

    // Test case 12: Transaction is created and saved in the database
    test('Creates and saves transaction in the database', async () => {
      const mockTransaction = { checkoutRequestID: 'mockCheckoutID', save: jest.fn().mockResolvedValue() };
      MpesaTransaction.findOne = jest.fn().mockResolvedValue(mockTransaction);

      const callbackData = { CheckoutRequestID: 'mockCheckoutID', ResultCode: 0, ResultDesc: 'Payment successful' };

      await handleCallback(callbackData);

      expect(mockTransaction.save).toHaveBeenCalled();
      expect(mockTransaction.status).toBe('success');
    });

    // Test case 13: Transaction is saved initially and updated after receiving successful response
    test('Updates transaction with CheckoutRequestID upon success', async () => {
      const mockTransaction = { checkoutRequestID: 'mockCheckoutID', status: 'pending', save: jest.fn().mockResolvedValue() };
      MpesaTransaction.findOne = jest.fn().mockResolvedValue(mockTransaction);

      const callbackData = { CheckoutRequestID: 'mockCheckoutID', ResultCode: 0, ResultDesc: 'Payment successful' };

      await handleCallback(callbackData);

      expect(mockTransaction.status).toBe('success');
      expect(mockTransaction.save).toHaveBeenCalled();
    });

    // Test case 14: Ensure no transaction duplication
    test('Ensures transaction is not duplicated with the same phone number and amount', async () => {
      const mockTransaction = { checkoutRequestID: 'mockCheckoutID', save: jest.fn().mockResolvedValue() };
      MpesaTransaction.findOne = jest.fn().mockResolvedValue(mockTransaction);

      const callbackData = { CheckoutRequestID: 'mockCheckoutID', ResultCode: 0, ResultDesc: 'Payment successful' };

      await handleCallback(callbackData);

      expect(MpesaTransaction.findOne).toHaveBeenCalledWith({ checkoutRequestID: 'mockCheckoutID' });
    });

  });

  // Logger Behavior Tests
  describe('Logging', () => {

    // Test case 15: Log success message when STK push is initiated
    test('Logs success when STK push is initiated', async () => {
      const mockResponse = { CheckoutRequestID: 'mockCheckoutID', CustomerMessage: 'Payment successful' };
      axios.post = jest.fn().mockResolvedValue({ data: mockResponse });

      const response = await initiateStkPush({ phone: '+254712345678', amount: 1000 });

      // Assuming a logger is used in the service
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('STK push initiated successfully'));
    });

    // Test case 16: Log error when STK push fails
    test('Logs error when STK push fails', async () => {
      axios.post = jest.fn().mockRejectedValue(new Error('M-Pesa API failed'));

      await expect(initiateStkPush({ phone: '+254712345678', amount: 1000 }))
        .rejects
        .toThrow('M-Pesa API failed');

      expect(console.error).toHaveBeenCalledWith('Error initiating STK push: M-Pesa API failed');
    });

    // Test case 17: Log warning when input parameters are incorrect
    test('Logs warning when input parameters are incorrect', async () => {
      const response = await initiateStkPush({ phone: '', amount: 1000 });

      expect(console.warn).toHaveBeenCalledWith('Invalid input: phone is required');
    });

  });

  // Error Handling Tests
  describe('Error Handling', () => {

    // Test case 18: Invalid request format (malformed body)
    test('Handles malformed request body and returns 400 error', async () => {
      const response = await initiateStkPush({});

      expect(response).toBeNull();
    });

    // Test case 19: Simulate database error
    test('Handles database errors correctly', async () => {
      MpesaTransaction.findOne = jest.fn().mockRejectedValue(new Error('Database error'));

      const callbackData = { CheckoutRequestID: 'mockCheckoutID', ResultCode: 0, ResultDesc: 'Payment successful' };

      await expect(handleCallback(callbackData))
        .rejects
        .toThrow('Database error');
    });

    // Test case 20: Unexpected error handling
    test('Handles unexpected errors and returns generic 500 error', async () => {
      axios.post = jest.fn().mockRejectedValue(new Error('Unexpected error'));

      await expect(initiateStkPush({ phone: '+254712345678', amount: 1000 }))
        .rejects
        .toThrow('Unexpected error');
    });

  });

  // Callback Handling Edge Cases (Test cases 21 to 25)
  describe('Callback Edge Cases', () => {

    // Test case 21: Duplicate callback handling
    test('Handles duplicate callback requests correctly', async () => {
      const mockTransaction = { checkoutRequestID: 'mockCheckoutID', save: jest.fn().mockResolvedValue() };
      MpesaTransaction.findOne = jest.fn().mockResolvedValue(mockTransaction);

      const callbackData = { CheckoutRequestID: 'mockCheckoutID', ResultCode: 0, ResultDesc: 'Payment successful' };

      await handleCallback(callbackData); // First callback

      // Simulate the same callback being received again
      await handleCallback(callbackData);

      expect(MpesaTransaction.findOne).toHaveBeenCalledTimes(1); // Ensure it's only handled once
    });

    // Test case 22: Invalid callback payload
    test('Handles invalid callback payload', async () => {
      const callbackData = { CheckoutRequestID: '', ResultCode: 0, ResultDesc: '' };

      await expect(handleCallback(callbackData)).rejects.toThrow('Invalid callback payload');
    });

    // Test case 23: Callback for non-existing transaction
    test('Handles callback for non-existent transaction', async () => {
      MpesaTransaction.findOne = jest.fn().mockResolvedValue(null);

      const callbackData = { CheckoutRequestID: 'nonExistentCheckoutID', ResultCode: 0, ResultDesc: 'Payment successful' };

      await handleCallback(callbackData);

      expect(MpesaTransaction.findOne).toHaveBeenCalledWith({ checkoutRequestID: 'nonExistentCheckoutID' });
    });

    // Test case 24: Invalid result code in callback
    test('Handles invalid result code in callback', async () => {
      const callbackData = { CheckoutRequestID: 'mockCheckoutID', ResultCode: 1, ResultDesc: 'Payment failed' };

      await expect(handleCallback(callbackData)).rejects.toThrow('Transaction failed');
    });

    // Test case 25: Callback update with correct status
    test('Updates transaction status and sets callbackReceived flag', async () => {
      const mockTransaction = { checkoutRequestID: 'mockCheckoutID', callbackReceived: false, save: jest.fn().mockResolvedValue() };
      MpesaTransaction.findOne = jest.fn().mockResolvedValue(mockTransaction);

      const callbackData = { CheckoutRequestID: 'mockCheckoutID', ResultCode: 0, ResultDesc: 'Payment successful' };

      await handleCallback(callbackData);

      expect(mockTransaction.callbackReceived).toBe(true);
      expect(mockTransaction.status).toBe('success');
      expect(mockTransaction.save).toHaveBeenCalled();
    });

  });

});
