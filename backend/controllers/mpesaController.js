const MpesaTransaction = require("../models/MpesaTransaction");
const { initiateStkPush, handleCallback } = require("../services/mpesaService");
const { mpesaLogger } = require("../utils/logger");

exports.stkPush = async (req, res) => {
  const { phone, amount, type = "Other" } = req.body;

  // Validate input parameters
  if (!phone || !amount) {
    mpesaLogger.warn("⚠️ Missing phone or amount", { phone, amount });
    return res.status(400).json({
      success: false,
      message: "Phone and amount are required",
    });
  }

  try {
    // Create a new transaction in the database
    const transaction = new MpesaTransaction({ phone, amount, type });
    await transaction.save();

    // Call the MPESA service to initiate the STK push
    const result = await initiateStkPush({ phone, amount });

    // Store the CheckoutRequestID in the transaction
    transaction.checkoutRequestID = result.CheckoutRequestID;
    await transaction.save();

    // Log the successful initiation
    mpesaLogger.info("✅ STK Push Initiated", {
      phone,
      amount,
      type,
      checkoutRequestID: result.CheckoutRequestID,
    });

    // Send a successful response back to the client
    return res.status(200).json({
      success: true,
      message: result.CustomerMessage || "STK Push sent successfully",
      checkoutRequestID: result.CheckoutRequestID,
    });
  } catch (error) {
    // Log error if the MPESA service fails
    mpesaLogger.error("❌ STK Push Failed", {
      phone,
      amount,
      type,
      error: error.message,
    });

    // Respond with a generic error message
    return res.status(500).json({
      success: false,
      message: "STK Push failed. Please try again.",
    });
  }
};

exports.callback = async (req, res) => {
  const callback = req.body?.Body?.stkCallback;
  if (!callback) {
    mpesaLogger.warn("⚠️ Invalid callback payload", { body: req.body });
    return res.status(400).json({ message: "Invalid callback structure" });
  }

  try {
    const transaction = await MpesaTransaction.findOne({ checkoutRequestID: callback.CheckoutRequestID });

    if (!transaction) {
      mpesaLogger.warn("⚠️ Callback for unknown transaction", { checkoutRequestID: callback.CheckoutRequestID });
    } else if (transaction.callbackReceived) {
      mpesaLogger.info("⏩ Duplicate callback ignored", { checkoutRequestID: callback.CheckoutRequestID });
      return res.status(200).json({ message: "Duplicate callback ignored" });
    }

    await handleCallback(callback);

    if (transaction) {
      transaction.status = callback.ResultCode === 0 ? "success" : "failed";
      transaction.resultCode = callback.ResultCode;
      transaction.description = callback.ResultDesc;
      transaction.message = callback.CustomerMessage;
      transaction.callbackReceived = true;
      await transaction.save();
    }

    mpesaLogger.info("✅ Callback processed", { checkoutRequestID: callback.CheckoutRequestID });
    return res.status(200).json({ message: "Callback received successfully" });
  } catch (error) {
    mpesaLogger.error("❌ Callback processing failed", { checkoutRequestID: callback.CheckoutRequestID, error: error.message });
    return res.status(200).json({ message: "Callback received with error" });
  }
};

exports.status = async (req, res) => {
  const { checkoutId } = req.params;
  try {
    const transaction = await MpesaTransaction.findOne({ checkoutRequestID: checkoutId });
    if (!transaction) {
      mpesaLogger.warn("⚠️ Transaction not found", { checkoutRequestID: checkoutId });
      return res.status(404).json({ success: false, status: "unknown", message: "No transaction found" });
    }
    mpesaLogger.info("📦 Payment status fetched", { checkoutRequestID: checkoutId });
    return res.status(200).json({ success: true, status: transaction.status, data: transaction });
  } catch (error) {
    mpesaLogger.error("❌ Error fetching payment status", { checkoutRequestID: checkoutId, error: error.message });
    return res.status(500).json({ success: false, message: "Failed to fetch payment status" });
  }
};
