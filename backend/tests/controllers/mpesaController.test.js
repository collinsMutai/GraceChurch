const request = require("supertest");
const { expect } = require("chai");  // Import expect from Chai
const app = require("../../server");  // Ensure this points to your Express app
const sinon = require("sinon");
const mpesaService = require("../../services/mpesaService");

describe("MPESA STK Push Controller", () => {
  let initiateStkPushStub;

  // Setup stub before each test
  beforeEach(() => {
    initiateStkPushStub = sinon.stub(mpesaService, "initiateStkPush").resolves({
      success: true,
      CheckoutRequestID: "abc123",
      CustomerMessage: "STK Push sent successfully"
    });
  });

  // Restore the stub after each test
  afterEach(() => {
    initiateStkPushStub.restore();
  });

  // Test case for missing phone number
  it("should return error if phone is missing", async () => {
    const res = await request(app)
      .post("/api/mpesa/stkpush")
      .send({ amount: 1000 });

    expect(res.status).to.equal(400);  // Expecting 400 as the phone is missing
    expect(res.body.error).to.equal("Phone number is required");
  });

  // Test case for missing amount
  it("should return error if amount is missing", async () => {
    const res = await request(app)
      .post("/api/mpesa/stkpush")
      .send({ phone: "254708000000" });

    expect(res.status).to.equal(400);  // Expecting 400 as the amount is missing
    expect(res.body.error).to.equal("Amount is required");
  });

  // Test case for valid data
  it("should return success if valid data is provided", async () => {
    const res = await request(app)
      .post("/api/mpesa/stkpush")
      .send({ phone: "254708000000", amount: 1000 });

    expect(res.status).to.equal(200);  // Expecting 200 for success
    expect(res.body.success).to.equal(true);
    expect(res.body.message).to.equal("STK Push sent successfully");
  });

  // Test case for MPESA service failure
  it("should return error if MPESA service fails", async () => {
    // Simulate failure by making the stub reject
    initiateStkPushStub.rejects(new Error("MPESA service failure"));

    const res = await request(app)
      .post("/api/mpesa/stkpush")
      .send({ phone: "254708000000", amount: 1000 });

    expect(res.status).to.equal(500);  // Expecting 500 for server error
    expect(res.body.message).to.equal("STK Push failed. Please try again.");
  });

  // Test case for logging errors on MPESA service failure
  it("should log error on MPESA service failure", async () => {
    // Simulate failure by making the stub reject
    initiateStkPushStub.rejects(new Error("MPESA service failure"));

    // Spy on console.error to check if error is logged
    const consoleErrorSpy = sinon.spy(console, "error");

    await request(app)
      .post("/api/mpesa/stkpush")
      .send({ phone: "254708000000", amount: 1000 });

    // Check if the error was logged
    expect(consoleErrorSpy.calledWith("Error initiating STK Push:", sinon.match.instanceOf(Error))).to.equal(true);

    consoleErrorSpy.restore();  // Restore the console spy
  });
});
