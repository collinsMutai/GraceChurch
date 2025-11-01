const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const request = require('supertest');
const app = require('../../server'); // Your Express app
const MpesaTransaction = require('../../models/MpesaTransaction');
const { initiateStkPush } = require('../../services/mpesaService');
const { mpesaLogger } = require('../../utils/logger');
const axios = require('axios');

// Mock the initiateStkPush service
sinon.stub(mpesaLogger, 'info');
sinon.stub(mpesaLogger, 'error');
sinon.stub(MpesaTransaction.prototype, 'save').resolves();

describe("MPESA STK Push Controller", () => {
  // Before each test, reset the stubs/mocks
  beforeEach(() => {
    sinon.restore();
  });

  it("should return error if phone is missing", async () => {
    const response = await request(app)
      .post("/api/mpesa/stkpush")
      .send({ amount: 1000, type: "Other" });

    expect(response.status).to.equal(400);
    expect(response.body.message).to.equal("Phone and amount are required");
  });

  it("should return error if amount is missing", async () => {
    const response = await request(app)
      .post("/api/mpesa/stkpush")
      .send({ phone: "254700000000" });

    expect(response.status).to.equal(400);
    expect(response.body.message).to.equal("Phone and amount are required");
  });

  it("should return success if valid data is provided", async () => {
    const mockResponse = {
      CheckoutRequestID: "123456",
      CustomerMessage: "Payment sent successfully"
    };

    // Mock initiateStkPush to return a mock response
    sinon.stub(initiateStkPush, 'initiateStkPush').resolves(mockResponse);
    
    // Log the axios call to verify the Bearer token
    sinon.stub(axios, 'post').callsFake((url, payload, { headers }) => {
      // Verify the Authorization header contains "Bearer "
      expect(headers.Authorization).to.match(/^Bearer /);  // Check if Authorization starts with "Bearer "
      return Promise.resolve({ data: mockResponse });  // Return mock response for the API call
    });

    const response = await request(app)
      .post("/api/mpesa/stkpush")
      .send({ phone: "254700000000", amount: 1000 });

    expect(response.status).to.equal(200);
    expect(response.body.success).to.equal(true);
    expect(response.body.checkoutRequestID).to.equal("123456");
    expect(response.body.message).to.equal("Payment sent successfully");
  });

  it("should return error if MPESA service fails", async () => {
    // Simulate a failure in initiateStkPush
    sinon.stub(initiateStkPush, 'initiateStkPush').rejects(new Error("MPESA API Error"));

    const response = await request(app)
      .post("/api/mpesa/stkpush")
      .send({ phone: "254700000000", amount: 1000 });

    expect(response.status).to.equal(500);
    expect(response.body.success).to.equal(false);
    expect(response.body.message).to.equal("STK Push failed. Please try again.");
  });

  it("should log error on MPESA service failure", async () => {
    // Simulate failure
    sinon.stub(initiateStkPush, 'initiateStkPush').rejects(new Error("MPESA API Error"));

    // Expect the error to be logged
    const logSpy = sinon.spy(mpesaLogger, 'error');

    await request(app)
      .post("/api/mpesa/stkpush")
      .send({ phone: "254700000000", amount: 1000 });

    expect(logSpy.calledOnce).to.be.true;
    expect(logSpy.args[0][0]).to.equal("❌ STK Push Error");
  });
});
