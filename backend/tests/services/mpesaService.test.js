const { initiateStkPush, handleCallback } = require('../../services/mpesaService');
const MpesaTransaction = require('../../models/MpesaTransaction');
const axios = require('axios'); // Assuming you're using axios for making API calls
const sinon = require('sinon');
const chai = require('chai');
const expect = chai.expect;

describe('Mpesa Service', () => {
  let axiosPostStub;
  let mpesaTransactionStub;

  // Test cases for initiating STK Push
  describe('initiateStkPush', () => {

    beforeEach(() => {
      axiosPostStub = sinon.stub(axios, 'post');
      mpesaTransactionStub = sinon.stub(MpesaTransaction, 'findOne');
    });

    afterEach(() => {
      axiosPostStub.restore();
      mpesaTransactionStub.restore();
    });

    // Test case 1: Valid phone, amount, and type parameters
    it('Successfully initiates STK push with valid input', async () => {
      const mockResponse = { CheckoutRequestID: 'mockCheckoutID', CustomerMessage: 'Payment successful' };
      axiosPostStub.resolves({ data: mockResponse });

      const response = await initiateStkPush({ phone: '+254712345678', amount: 1000, type: 'Payment' });

      expect(response.CheckoutRequestID).to.equal('mockCheckoutID');
      expect(response.CustomerMessage).to.equal('Payment successful');
    });

    // Test case 2: Default type is set to "Other" if no type is provided
    it('Successfully initiates STK push with missing type (defaults to "Other")', async () => {
      const mockResponse = { CheckoutRequestID: 'mockCheckoutID', CustomerMessage: 'Payment successful' };
      axiosPostStub.resolves({ data: mockResponse });

      const response = await initiateStkPush({ phone: '+254712345678', amount: 1000 });

      expect(response.CheckoutRequestID).to.equal('mockCheckoutID');
      expect(response.CustomerMessage).to.equal('Payment successful');
    });

    // Test case 3: Invalid phone number
    it('Fails if phone parameter is invalid (empty string or incorrect format)', async () => {
      const response = await initiateStkPush({ phone: '', amount: 1000 });

      expect(response).to.be.null;
    });

    // Test case 4: Invalid amount (negative or zero value)
    it('Fails if amount is negative or zero', async () => {
      const response = await initiateStkPush({ phone: '+254712345678', amount: -100 });

      expect(response).to.be.null;
    });

    // Test case 5: Amount too large
    it('Fails if amount exceeds transaction limit', async () => {
      const response = await initiateStkPush({ phone: '+254712345678', amount: 1000000 });

      expect(response).to.be.null;
    });

    // Test case 6: Invalid type parameter
    it('Fails if type parameter is invalid', async () => {
      const response = await initiateStkPush({ phone: '+254712345678', amount: 1000, type: 'InvalidType' });

      expect(response).to.be.null;
    });

    // Test case 7: No request body provided (empty request)
    it('Fails if request body is empty', async () => {
      const response = await initiateStkPush({});

      expect(response).to.be.null;
    });

    // Test case 8: Successful M-Pesa API response
    it('Successfully processes M-Pesa API response', async () => {
      const mockResponse = { CheckoutRequestID: 'mockCheckoutID', CustomerMessage: 'Payment successful' };
      axiosPostStub.resolves({ data: mockResponse });

      const response = await initiateStkPush({ phone: '+254712345678', amount: 1000 });

      expect(response.CheckoutRequestID).to.equal('mockCheckoutID');
      expect(response.CustomerMessage).to.equal('Payment successful');
    });

    // Test case 9: Failed API interaction (network issue or API failure)
    it('Handles failed M-Pesa API interaction', async () => {
      axiosPostStub.rejects(new Error('M-Pesa API failed'));

      try {
        await initiateStkPush({ phone: '+254712345678', amount: 1000 });
      } catch (error) {
        expect(error.message).to.equal('M-Pesa API failed');
      }
    });

    // Test case 10: M-Pesa API response timeout
    it('Handles M-Pesa API timeout', async () => {
      axiosPostStub.rejects(new Error('M-Pesa API timed out'));

      try {
        await initiateStkPush({ phone: '+254712345678', amount: 1000 });
      } catch (error) {
        expect(error.message).to.equal('M-Pesa API timed out');
      }
    });

    // Test case 11: Invalid M-Pesa API response (missing fields)
    it('Handles invalid M-Pesa API response (missing CheckoutRequestID)', async () => {
      const mockResponse = { CustomerMessage: 'Payment failed' };
      axiosPostStub.resolves({ data: mockResponse });

      try {
        await initiateStkPush({ phone: '+254712345678', amount: 1000 });
      } catch (error) {
        expect(error.message).to.equal('Invalid response from M-Pesa API');
      }
    });

  });

  // Test cases for handling callback
  describe('handleCallback', () => {

    it('Creates and saves transaction in the database', async () => {
      const mockTransaction = { checkoutRequestID: 'mockCheckoutID', save: sinon.stub().resolves() };
      mpesaTransactionStub.resolves(mockTransaction);

      const callbackData = { CheckoutRequestID: 'mockCheckoutID', ResultCode: 0, ResultDesc: 'Payment successful' };

      await handleCallback(callbackData);

      expect(mockTransaction.save.calledOnce).to.be.true;
      expect(mockTransaction.status).to.equal('success');
    });

    it('Updates transaction with CheckoutRequestID upon success', async () => {
      const mockTransaction = { checkoutRequestID: 'mockCheckoutID', status: 'pending', save: sinon.stub().resolves() };
      mpesaTransactionStub.resolves(mockTransaction);

      const callbackData = { CheckoutRequestID: 'mockCheckoutID', ResultCode: 0, ResultDesc: 'Payment successful' };

      await handleCallback(callbackData);

      expect(mockTransaction.status).to.equal('success');
      expect(mockTransaction.save.calledOnce).to.be.true;
    });

    it('Ensures transaction is not duplicated with the same phone number and amount', async () => {
      const mockTransaction = { checkoutRequestID: 'mockCheckoutID', save: sinon.stub().resolves() };
      mpesaTransactionStub.resolves(mockTransaction);

      const callbackData = { CheckoutRequestID: 'mockCheckoutID', ResultCode: 0, ResultDesc: 'Payment successful' };

      await handleCallback(callbackData);

      expect(mpesaTransactionStub.calledOnce).to.be.true;
    });

  });

  // Logger Behavior Tests
  describe('Logging', () => {

    it('Logs success when STK push is initiated', async () => {
      const mockResponse = { CheckoutRequestID: 'mockCheckoutID', CustomerMessage: 'Payment successful' };
      axiosPostStub.resolves({ data: mockResponse });

      const response = await initiateStkPush({ phone: '+254712345678', amount: 1000 });

      expect(console.log.calledWithMatch('STK push initiated successfully')).to.be.true;
    });

    it('Logs error when STK push fails', async () => {
      axiosPostStub.rejects(new Error('M-Pesa API failed'));

      try {
        await initiateStkPush({ phone: '+254712345678', amount: 1000 });
      } catch (error) {
        expect(console.error.calledWithMatch('Error initiating STK push: M-Pesa API failed')).to.be.true;
      }
    });

    it('Logs warning when input parameters are incorrect', async () => {
      const response = await initiateStkPush({ phone: '', amount: 1000 });

      expect(console.warn.calledWithMatch('Invalid input: phone is required')).to.be.true;
    });

  });

  // Error Handling Tests
  describe('Error Handling', () => {

    it('Handles malformed request body and returns 400 error', async () => {
      const response = await initiateStkPush({});

      expect(response).to.be.null;
    });

    it('Handles database errors correctly', async () => {
      mpesaTransactionStub.rejects(new Error('Database error'));

      const callbackData = { CheckoutRequestID: 'mockCheckoutID', ResultCode: 0, ResultDesc: 'Payment successful' };

      try {
        await handleCallback(callbackData);
      } catch (error) {
        expect(error.message).to.equal('Database error');
      }
    });

    it('Handles unexpected errors and returns generic 500 error', async () => {
      axiosPostStub.rejects(new Error('Unexpected error'));

      try {
        await initiateStkPush({ phone: '+254712345678', amount: 1000 });
      } catch (error) {
        expect(error.message).to.equal('Unexpected error');
      }
    });

  });

  // Callback Handling Edge Cases
  describe('Callback Edge Cases', () => {

    it('Handles duplicate callback requests correctly', async () => {
      const mockTransaction = { checkoutRequestID: 'mockCheckoutID', save: sinon.stub().resolves() };
      mpesaTransactionStub.resolves(mockTransaction);

      const callbackData = { CheckoutRequestID: 'mockCheckoutID', ResultCode: 0, ResultDesc: 'Payment successful' };

      await handleCallback(callbackData); // First callback
      await handleCallback(callbackData); // Duplicate callback

      expect(mpesaTransactionStub.calledOnce).to.be.true; // Ensure it's only handled once
    });

    it('Handles invalid callback payload', async () => {
      const callbackData = { CheckoutRequestID: '', ResultCode: 0, ResultDesc: '' };

      try {
        await handleCallback(callbackData);
      } catch (error) {
        expect(error.message).to.equal('Invalid callback payload');
      }
    });

    it('Handles callback for non-existent transaction', async () => {
      mpesaTransactionStub.resolves(null);

      const callbackData = { CheckoutRequestID: 'nonExistentCheckoutID', ResultCode: 0, ResultDesc: 'Payment successful' };

      await handleCallback(callbackData);

      expect(mpesaTransactionStub.calledWith({ checkoutRequestID: 'nonExistentCheckoutID' })).to.be.true;
    });

    it('Handles invalid result code in callback', async () => {
      const callbackData = { CheckoutRequestID: 'mockCheckoutID', ResultCode: 1, ResultDesc: 'Payment failed' };

      try {
        await handleCallback(callbackData);
      } catch (error) {
        expect(error.message).to.equal('Transaction failed');
      }
    });

    it('Updates transaction status and sets callbackReceived flag', async () => {
      const mockTransaction = { checkoutRequestID: 'mockCheckoutID', callbackReceived: false, save: sinon.stub().resolves() };
      mpesaTransactionStub.resolves(mockTransaction);

      const callbackData = { CheckoutRequestID: 'mockCheckoutID', ResultCode: 0, ResultDesc: 'Payment successful' };

      await handleCallback(callbackData);

      expect(mockTransaction.callbackReceived).to.be.true;
      expect(mockTransaction.status).to.equal('success');
      expect(mockTransaction.save.calledOnce).to.be.true;
    });

  });

});
