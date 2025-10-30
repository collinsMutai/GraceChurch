"use strict";

const axios = require("axios");
const MpesaTransaction = require("../models/MpesaTransaction");
const logger = require("../utils/logger");

// === Configuration ===
const config = {
  shortcode: process.env.MPESA_SHORTCODE,
  lipaNaMpesaOnlinePasskey: process.env.MPESA_PASSKEY,
  token: process.env.MPESA_BEARER_TOKEN, // generate using OAuth
  baseUrl: process.env.MPESA_BASE_URL || "https://sandbox.safaricom.co.ke",
};

/* ==========================================================
   Initiate STK Push
========================================================== */
async function initiateStkPush({ phone, amount }) {
  try {
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:TZ.]/g, "")
      .slice(0, 14); // YYYYMMDDHHMMSS

    const password = Buffer.from(
      `${config.shortcode}${config.lipaNaMpesaOnlinePasskey}${timestamp}`
    ).toString("base64");

    const payload = {
      BusinessShortCode: config.shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: formatPhone(phone),
      PartyB: config.shortcode,
      PhoneNumber: formatPhone(phone),
      CallBackURL: `${process.env.APP_URL}/api/mpesa/callback`,
      AccountReference: "Payment",
      TransactionDesc: "Payment from app",
    };

    const { data } = await axios.post(`${config.baseUrl}/mpesa/stkpush/v1/processrequest`, payload, {
      headers: {
        Authorization: `Bearer ${config.token}`,
        "Content-Type": "application/json",
      },
    });

    return data; // contains CheckoutRequestID and CustomerMessage
  } catch (error) {
    logger.error("❌ STK Push Error", { error: error.message });
    throw new Error(error.response?.data?.errorMessage || error.message);
  }
}

/* ==========================================================
   Handle STK Callback
========================================================== */
async function handleCallback(callback) {
  const checkoutRequestID = callback.CheckoutRequestID;

  const transaction = await MpesaTransaction.findOne({ checkoutRequestID });

  if (!transaction) {
    logger.warn("⚠️ Callback for unknown transaction", { checkoutRequestID });
    return { skipped: true };
  }

  if (transaction.callbackReceived) {
    logger.info("⏩ Duplicate callback ignored", { checkoutRequestID });
    return { skipped: true };
  }

  // Update transaction based on callback
  transaction.status = callback.ResultCode === 0 ? "success" : "failed";
  transaction.resultCode = callback.ResultCode;
  transaction.description = callback.ResultDesc;
  transaction.message = callback.CustomerMessage;
  transaction.callbackReceived = true;

  await transaction.save();
  return transaction;
}

/* ==========================================================
   Get Payment Status
========================================================== */
async function getPaymentStatus(checkoutRequestID) {
  const transaction = await MpesaTransaction.findOne({ checkoutRequestID });
  return transaction || null;
}

/* ==========================================================
   Helpers
========================================================== */
function formatPhone(phone) {
  // Convert 07xxxxxxx or +2547xxxxxxx to 2547xxxxxxx
  if (phone.startsWith("0")) return `254${phone.slice(1)}`;
  if (phone.startsWith("+")) return phone.slice(1);
  return phone;
}

module.exports = {
  initiateStkPush,
  handleCallback,
  getPaymentStatus,
};
