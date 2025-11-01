"use strict";

const axios = require("axios");
const MpesaTransaction = require("../models/MpesaTransaction");
const logger = require("../utils/logger");

// === Configuration ===
const config = {
  shortcode: process.env.MPESA_SHORTCODE,  // Read the shortcode from .env
  lipaNaMpesaOnlinePasskey: process.env.MPESA_PASSKEY,  // Read the passkey from .env
  baseUrl: process.env.MPESA_BASE_URL || "https://sandbox.safaricom.co.ke",  // Default to sandbox if not set in .env
  appUrl: process.env.APP_URL,  // Your app's base URL, should be in .env
  mpesaConsumerKey: process.env.MPESA_CONSUMER_KEY,  // Consumer Key from .env
  mpesaConsumerSecret: process.env.MPESA_CONSUMER_SECRET,  // Consumer Secret from .env
};

// Function to get Bearer Token
async function getBearerToken() {
  try {
    const auth = Buffer.from(
      `${config.mpesaConsumerKey}:${config.mpesaConsumerSecret}`
    ).toString('base64'); // Base64 encode the Consumer Key and Secret
    
    // Request for Bearer Token
    const response = await axios({
      method: 'get',
      url: `${config.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
      headers: {
        'Authorization': `Basic ${auth}`, // Basic authorization for token request
      },
    });

    const bearerToken = response.data.access_token; // The token you'll use in the Authorization header
    console.log('Bearer Token:', bearerToken);  // Log the Bearer token for debugging
    return bearerToken;
  } catch (error) {
    console.error('Error getting Bearer Token:', error.response?.data || error.message);
    throw new Error('Failed to get Bearer token');
  }
}

/* ==========================================================
   Initiate STK Push
========================================================== */
async function initiateStkPush({ phone, amount }) {
  try {
    // Generate timestamp for the request
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:TZ.]/g, "")
      .slice(0, 14); // Format: YYYYMMDDHHMMSS

    // Generate password using shortcode, passkey, and timestamp
    const password = Buffer.from(
      `${config.shortcode}${config.lipaNaMpesaOnlinePasskey}${timestamp}`
    ).toString("base64");

    // Get the Bearer token dynamically (instead of from the .env file)
    const token = await getBearerToken();

    // Log the Authorization header for debugging
    console.log("Authorization header:", `Bearer ${token}`);

    // Payload for the STK Push API
    const payload = {
      BusinessShortCode: config.shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: formatPhone(phone),
      PartyB: config.shortcode,
      PhoneNumber: formatPhone(phone),
      CallBackURL: `${config.appUrl}/api/mpesa/callback`,  // Make sure APP_URL is defined in .env
      AccountReference: "Payment",
      TransactionDesc: "Payment from app",
    };

    // Make POST request to initiate the STK push
    const { data } = await axios.post(
      `${config.baseUrl}/mpesa/stkpush/v1/processrequest`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,  // Bearer token attached here
          "Content-Type": "application/json",
        },
      }
    );

    // Log the response from MPESA API
    console.log("MPESA Response:", data);

    return data;  // Contains CheckoutRequestID and CustomerMessage
  } catch (error) {
    // Log the error
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
