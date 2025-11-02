const axios = require("axios");
const MpesaTransaction = require("../models/MpesaTransaction");

// === Utility: Get Access Token ===
const getAccessToken = async () => {
  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString("base64");

  const res = await axios.get(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    {
      headers: { Authorization: `Basic ${auth}` },
    }
  );

  return res.data.access_token;
};

// === Utility: Format Timestamp ===
const getTimestamp = () => {
  const date = new Date();
  return (
    date.getFullYear().toString() +
    ("0" + (date.getMonth() + 1)).slice(-2) +
    ("0" + date.getDate()).slice(-2) +
    ("0" + date.getHours()).slice(-2) +
    ("0" + date.getMinutes()).slice(-2) +
    ("0" + date.getSeconds()).slice(-2)
  );
};

// === Utility: Translate ResultCode to status and message ===
const getResultDetails = (code) => {
  const map = {
    0: {
      status: "success",
      message: "✅ Payment successful. Thank you for your donation!",
    },
    1: {
      status: "insufficient_funds",
      message: "❌ Transaction failed: Insufficient balance.",
    },
    1032: {
      status: "cancelled_by_user",
      message: "⚠️ You cancelled the transaction.",
    },
    1037: {
      status: "timeout_user_unreachable",
      message: "⌛ Timeout: No response received. Please try again.",
    },
    2001: {
      status: "invalid_phone_number",
      message: "❌ Invalid phone number or transaction initiator.",
    },
  };

  return (
    map[code] || {
      status: "failed",
      message: "❌ Transaction failed. Please try again later.",
    }
  );
};

const initiateStkPush = async ({ phone, amount }) => {
  const accessToken = await getAccessToken();
  const timestamp = getTimestamp();
  const password = Buffer.from(
    `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
  ).toString("base64");

  const payload = {
    BusinessShortCode: process.env.MPESA_SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: amount,
    PartyA: phone,
    PartyB: process.env.MPESA_SHORTCODE,
    PhoneNumber: phone,
    CallBackURL: process.env.MPESA_CALLBACK_URL,
    AccountReference: "Donation",
    TransactionDesc: "Donation to FutureTech",
  };

  const response = await axios.post(
    "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
    payload,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data = response.data;

  // Save initial pending transaction to MongoDB
  await MpesaTransaction.create({
    phone,
    amount,
    checkoutRequestID: data.CheckoutRequestID,
    status: "pending",
    message: "📲 Waiting for user to authorize the transaction...",
  });

  return data;
};

const handleCallback = async (callback) => {
  const { CheckoutRequestID, ResultCode, ResultDesc } = callback;
  const { status, message } = getResultDetails(ResultCode);

  const existing = await MpesaTransaction.findOne({
    checkoutRequestID: CheckoutRequestID,
  });

  if (!existing) {
    throw new Error(`Callback for unknown CheckoutRequestID: ${CheckoutRequestID}`);
  }

  if (existing.status !== "pending") {
    // Ignore duplicate callbacks for completed transactions
    return { skipped: true };
  }

  await MpesaTransaction.updateOne(
    { checkoutRequestID: CheckoutRequestID },
    {
      status,
      resultCode: ResultCode,
      description: ResultDesc,
      message,
      timestamp: new Date(),
    }
  );

  return { skipped: false, status, message };
};

const getPaymentStatus = async (checkoutRequestID) => {
  const transaction = await MpesaTransaction.findOne({ checkoutRequestID });

  if (!transaction) {
    throw new Error("Transaction not found");
  }

  return transaction;
};

module.exports = {
  initiateStkPush,
  handleCallback,
  getPaymentStatus,
};
