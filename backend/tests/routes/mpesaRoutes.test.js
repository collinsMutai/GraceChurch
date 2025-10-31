const request = require("supertest"); // Supertest is used to make HTTP requests to the server in tests
const server = require("../../server"); // Import the Express app from server.js (the app being tested)
const { initiateStkPush } = require("../../services/mpesaService"); // Import the function for initiating STK Push
const MpesaTransaction = require("../../models/MpesaTransaction"); // Import the MpesaTransaction model for mocking

// Mock the service functions and models to isolate the tests from actual database and external calls
jest.mock("../../services/mpesaService"); // Mock the Mpesa service functions
jest.mock("../../models/MpesaTransaction"); // Mock the MpesaTransaction model to avoid actual DB interactions

describe("Mpesa Routes", () => {
  // Tests for the STK Push route (POST /api/mpesa/stkpush)
  describe("POST /api/mpesa/stkpush", () => {
    // Test Case 1: STK Push successfully initiated
    test("1. STK Push successfully initiated", async () => {
      initiateStkPush.mockResolvedValue({
        CheckoutRequestID: "mockCheckoutID",
        CustomerMessage: "Payment successful",
      });

      const response = await request(server)
        .post("/api/mpesa/stkpush")
        .send({ phone: "+254712345678", amount: 1000 }) // Send valid phone number and amount
        .expect(200); // Expect a successful response (200 OK)

      // Assert the response body contains success information
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Payment successful");
      expect(response.body.checkoutRequestID).toBe("mockCheckoutID");
    });

    // Test Case 2: STK Push fails with missing amount
    test("2. STK Push fails with missing amount", async () => {
      const response = await request(server)
        .post("/api/mpesa/stkpush")
        .send({ phone: "+254712345678" }) // Missing amount
        .expect(400); // Expect a bad request error (400)

      // Assert the error message indicates the missing amount
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Amount is required");
    });

    // Test Case 3: STK Push fails with missing phone
    test("3. STK Push fails with missing phone", async () => {
      const response = await request(server)
        .post("/api/mpesa/stkpush")
        .send({ amount: 1000 }) // Missing phone
        .expect(400);

      // Assert the error message indicates the missing phone number
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Phone number is required");
    });

    // Test Case 4: STK Push fails with negative amount
    test("4. STK Push fails with negative amount", async () => {
      const response = await request(server)
        .post("/api/mpesa/stkpush")
        .send({ phone: "+254712345678", amount: -500 }) // Negative amount
        .expect(400);

      // Assert the error message indicates that the amount must be positive
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Amount must be a positive value");
    });

    // Test Case 5: STK Push sets default type to "Other" if type is missing
    test('5. STK Push sets default type to "Other" if type is missing', async () => {
      initiateStkPush.mockResolvedValue({
        CheckoutRequestID: "mockCheckoutID",
        CustomerMessage: "Payment successful",
      });

      const response = await request(server)
        .post("/api/mpesa/stkpush")
        .send({ phone: "+254712345678", amount: 1000 }) // Missing 'type'
        .expect(200);

      // Assert that type defaults to "Other"
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Payment successful");
      expect(response.body.checkoutRequestID).toBe("mockCheckoutID");
    });

    // Test Case 6: STK Push fails with unsupported type
    test("6. STK Push fails with unsupported type", async () => {
      const response = await request(server)
        .post("/api/mpesa/stkpush")
        .send({ phone: "+254712345678", amount: 1000, type: "UnsupportedType" }) // Invalid type
        .expect(400);

      // Assert that the unsupported type triggers an error
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Invalid type parameter");
    });

    // Test Case 7: STK Push fails with large amount (greater than transaction limit)
    test("7. STK Push fails with large amount (greater than transaction limit)", async () => {
      const response = await request(server)
        .post("/api/mpesa/stkpush")
        .send({ phone: "+254712345678", amount: 1000000 }) // Amount exceeding the limit
        .expect(400);

      // Assert that the amount exceeds the transaction limit
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Amount exceeds transaction limit");
    });

    // Test Case 8: STK Push handles unexpected errors
    test("8. STK Push handles unexpected errors", async () => {
      initiateStkPush.mockRejectedValue(new Error("Unexpected error")); // Simulate unexpected error

      const response = await request(server)
        .post("/api/mpesa/stkpush")
        .send({ phone: "+254712345678", amount: 1000 })
        .expect(500); // Expect internal server error (500)

      // Assert that unexpected errors are handled
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Unexpected error occurred");
    });
  });

  // Tests for the Callback route (POST /api/mpesa/callback)
  describe("POST /api/mpesa/callback", () => {
    // Test Case 9: Successfully processes callback
    test("9. Successfully processes callback", async () => {
      const callbackData = {
        CheckoutRequestID: "mockCheckoutID",
        ResultCode: 0,
        ResultDesc: "Payment successful",
      };

      const response = await request(server)
        .post("/api/mpesa/callback")
        .send({ Body: { stkCallback: callbackData } }) // Simulate callback data
        .expect(200); // Expect successful callback response

      // Assert the response indicates successful callback processing
      expect(response.body.message).toBe("Callback received successfully");
    });

    // Test Case 10: Handles duplicate callback for the same transaction
    test("10. Handles duplicate callback for the same transaction", async () => {
      const callbackData = {
        CheckoutRequestID: "mockCheckoutID",
        ResultCode: 0,
        ResultDesc: "Payment successful",
      };

      // Mock the scenario where the transaction already exists
      MpesaTransaction.findOne = jest
        .fn()
        .mockResolvedValueOnce({ checkoutRequestID: "mockCheckoutID" });

      const firstResponse = await request(server)
        .post("/api/mpesa/callback")
        .send({ Body: { stkCallback: callbackData } })
        .expect(200);

      const secondResponse = await request(server)
        .post("/api/mpesa/callback")
        .send({ Body: { stkCallback: callbackData } })
        .expect(400); // Expect the second callback to be ignored

      // Assert the second callback is rejected due to duplication
      expect(secondResponse.body.message).toBe("Duplicate callback ignored");
    });

    // Test Case 11: Returns error if callback payload is invalid (missing data)
    test("11. Returns error if callback payload is invalid (missing data)", async () => {
      const response = await request(server)
        .post("/api/mpesa/callback")
        .send({ Body: {} }) // Invalid payload (empty)
        .expect(400); // Expect bad request error (400)

      // Assert the error message indicates invalid structure
      expect(response.body.message).toBe("Invalid callback structure");
    });

    // Test Case 12: Returns error if callback contains invalid ResultCode
    test("12. Returns error if callback contains invalid ResultCode", async () => {
      const callbackData = {
        CheckoutRequestID: "mockCheckoutID",
        ResultCode: 1,
        ResultDesc: "Payment failed",
      };

      const response = await request(server)
        .post("/api/mpesa/callback")
        .send({ Body: { stkCallback: callbackData } })
        .expect(400);

      // Assert the error message indicates the failure
      expect(response.body.message).toBe("Transaction failed");
    });

    // Test Case 13: Returns error if callback is missing required fields
    test("13. Returns error if callback is missing required fields", async () => {
      const callbackData = {
        CheckoutRequestID: "mockCheckoutID",
        ResultCode: 0,
      }; // Missing ResultDesc

      const response = await request(server)
        .post("/api/mpesa/callback")
        .send({ Body: { stkCallback: callbackData } })
        .expect(400);

      // Assert that missing fields trigger an error
      expect(response.body.message).toBe("Missing required callback fields");
    });

    // Test Case 14: Callback with non-existent transaction
    test("14. Callback with non-existent transaction", async () => {
      const callbackData = {
        CheckoutRequestID: "nonExistentCheckoutID",
        ResultCode: 0,
        ResultDesc: "Payment successful",
      };

      MpesaTransaction.findOne = jest.fn().mockResolvedValue(null); // Simulate no transaction found

      const response = await request(server)
        .post("/api/mpesa/callback")
        .send({ Body: { stkCallback: callbackData } })
        .expect(400);

      // Assert the error message indicates no transaction found
      expect(response.body.message).toBe("Transaction not found");
    });

    // Test Case 15: Handles callback with invalid checkoutRequestID
    test("15. Handles callback with invalid checkoutRequestID", async () => {
      const callbackData = {
        CheckoutRequestID: "invalidCheckoutID",
        ResultCode: 0,
        ResultDesc: "Payment successful",
      };

      MpesaTransaction.findOne = jest.fn().mockResolvedValue(null); // Simulate no transaction found

      const response = await request(server)
        .post("/api/mpesa/callback")
        .send({ Body: { stkCallback: callbackData } })
        .expect(400);

      // Assert the error message indicates the invalid checkoutRequestID
      expect(response.body.message).toBe("Transaction not found");
    });

    // Test Case 16: Should allow a request within the rate limit
    test("16. Should allow a request within the rate limit", async () => {
      const response = await request(server)
        .post("/api/mpesa/stkpush")
        .send({ phone: "+254712345678", amount: 1000 })
        .expect(200);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    // Test Case 17: Should return 429 Too Many Requests if rate limit is exceeded
    test("17. Should return 429 Too Many Requests if rate limit is exceeded", async () => {
      // Simulate 3 requests
      for (let i = 0; i < 3; i++) {
        await request(server)
          .post("/api/mpesa/stkpush")
          .send({ phone: "+254712345678", amount: 1000 })
          .expect(200);
      }

      // The 4th request should hit the rate limit
      const response = await request(server)
        .post("/api/mpesa/stkpush")
        .send({ phone: "+254712345678", amount: 1000 })
        .expect(429); // Expect rate-limited response

      expect(response.body.message).toBe("Too many STK push requests");
    });

    // Test Case 18: Should reset the rate limit after the window expires
    test("18. Should reset the rate limit after the window expires", async () => {
      // Simulate 3 requests
      for (let i = 0; i < 3; i++) {
        await request(server)
          .post("/api/mpesa/stkpush")
          .send({ phone: "+254712345678", amount: 1000 })
          .expect(200);
      }

      // Wait for 10 minutes (rate limit window)
      await new Promise((resolve) => setTimeout(resolve, 10 * 60 * 1000));

      // After 10 minutes, the 4th request should pass
      const response = await request(server)
        .post("/api/mpesa/stkpush")
        .send({ phone: "+254712345678", amount: 1000 })
        .expect(200); // Success after the window resets

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
