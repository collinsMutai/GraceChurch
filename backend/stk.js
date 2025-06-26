const axios = require("axios");
const moment = require("moment");

// Replace with your Safaricom credentials
const shortCode = "YOUR_SHORTCODE";
const passkey = "YOUR_PASSKEY";
const consumerKey = "YOUR_CONSUMER_KEY";
const consumerSecret = "YOUR_CONSUMER_SECRET";
const callbackURL = "https://yourdomain.com/api/mpesa/callback";

const getAccessToken = async () => {
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString(
    "base64"
  );
  const res = await axios.get(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    {
      headers: { Authorization: `Basic ${auth}` },
    }
  );
  return res.data.access_token;
};

const initiateSTKPush = async (phoneNumber, amount) => {
  const accessToken = await getAccessToken();
  const timestamp = moment().format("YYYYMMDDHHmmss");
  const password = Buffer.from(shortCode + passkey + timestamp).toString(
    "base64"
  );

  const payload = {
    BusinessShortCode: shortCode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: amount,
    PartyA: phoneNumber,
    PartyB: shortCode,
    PhoneNumber: phoneNumber,
    CallBackURL: callbackURL,
    AccountReference: "Tithe",
    TransactionDesc: "Sunday Tithe",
  };

  const res = await axios.post(
    "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
    payload,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  return res.data;
};

module.exports = { initiateSTKPush };
