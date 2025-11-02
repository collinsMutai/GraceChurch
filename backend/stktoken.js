// stktoken.js
const axios = require('axios');
const querystring = require('querystring');

const MPESA_CONSUMER_KEY = 'plHWRw4lThuEBDYACwSiwFIAgOjm3j3O8OSpjIH3Gr9T9jsB';
const MPESA_CONSUMER_SECRET = 'ACFlYkeQ9mumfpX5aHff1BDkDExXe1Ms02UDp0FU0BrEsFY6LHHwIPa5JHb4e9nQ';
const MPESA_BASE_URL = 'https://sandbox.safaricom.co.ke';

const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');

async function generateAccessToken() {
  try {
    const response = await axios.get(`${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: {
        'Authorization': `Basic ${auth}`,
      },
    });
    console.log('Access Token:', response.data.access_token);
    return response.data.access_token;  // Return token for use in other services
  } catch (error) {
    console.error('Error generating token:', error.response?.data || error.message);
    throw new Error('Failed to generate access token');
  }
}

module.exports = { generateAccessToken };
