
const mongoose = require("mongoose");
const walletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },

  balance: {
    type: Number,
    default: 0
  },

  walletType: {
    type: String,
    enum: ["USER", "FRANCHISE"],
    default: "USER"
  },

  status: {
    type: String,
    enum: ["ACTIVE", "BLOCKED"],
    default: "ACTIVE"
  }

}, { timestamps: true });

module.exports = mongoose.model("wallet", walletSchema);
