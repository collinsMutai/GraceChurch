const mongoose = require("mongoose");

const MpesaTransactionSchema = new mongoose.Schema({
  phone: String,
  amount: Number,
  status: { type: String, default: "pending" },
  resultCode: Number,
  description: String,
  message: String,
  checkoutRequestID: { type: String, unique: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("MpesaTransaction", MpesaTransactionSchema);
