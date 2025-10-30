const mongoose = require("mongoose");

const MpesaTransactionSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { 
    type: String, 
    enum: ["Offering", "Tithes", "Donations", "Other"], 
    default: "Other",
  },
  status: { 
    type: String, 
    enum: ["pending", "success", "failed"], 
    default: "pending" 
  },
  resultCode: Number,             // from M-PESA callback
  description: String,            // from M-PESA callback
  message: String,                // CustomerMessage from M-PESA
  checkoutRequestID: { type: String, unique: true, required: true },
  merchantRequestID: String,      // optional
  callbackReceived: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("MpesaTransaction", MpesaTransactionSchema);
