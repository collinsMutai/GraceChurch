const request = require("supertest"); // Supertest is used to make HTTP requests to the server in tests
const server = require("../../server"); // Import the Express app from server.js (the app being tested)
const { initiateStkPush } = require("../../services/mpesaService"); // Import the function for initiating STK Push
const MpesaTransaction = require("../../models/MpesaTransaction"); // Import the MpesaTransaction model for mocking
const sinon = require("sinon"); // Import Sinon for mocking
const { expect } = require("chai"); // Use Chai for assertions

describe("Mpesa Routes", () => {
  let initiateStkPushStub;
  let findOneStub;

  // Test suite for STK Push route (POST /api/mpesa/stkpush)
  describe("POST /api/mpesa/stkpush", () => {
    beforeEach(() => {
      // Create a stub for initiateStkPush
      initiateStkPushStub = sinon.stub(initiateStkPush);
      // Stub the MpesaTransaction findOne method
      findOneStub = sinon.stub(MpesaTransaction, "findOne");
    });

    afterEach(() => {
      // Restore stubs after each test
      sinon.restore();
    });

    // Test 1: STK Push successfully initiated
    it("1. STK Push successfully initiated", async () => {
      initiateStkPushStub.resolves({
        CheckoutRequestID: "mockCheckoutID",
        CustomerMessage: "Payment successful",
      });

      const response = await request(server)
        .post("/api/mpesa/stkpush")
        .send({ phone: "+254797759858", amount: 1 })
        .expect(200);

      expect(response.body.success).to.be.true;
      expect(response.body.message).to.equal("Payment successful");
      expect(response.body.checkoutRequestID).to.equal("mockCheckoutID");
    });
  });
});
