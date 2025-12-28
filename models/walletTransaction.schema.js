
const mongoose = require("mongoose");

const walletTransactionSchema = new mongoose.Schema({
  walletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Wallet",
    required: true
  },

  type: {
    type: String,
    enum: ["CREDIT", "DEBIT"],
    required: true
  },

  amount: {
    type: Number,
    required: true
  },

  reason: {
    type: String,
    enum: [
      "ORDER_PAYMENT",
      "REFUND",
      "CASHBACK",
      "FRANCHISE_COMMISSION",
      "ADMIN_ADJUSTMENT"
    ]
  },

  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order"
  },

  balanceAfter: Number
}, { timestamps: true });

module.exports= mongoose.model("walletTransaction", walletTransactionSchema);
