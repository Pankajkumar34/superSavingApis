// models/FranchiseStockTransfer.js
const mongoose = require("mongoose");
const transferItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  skuId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Skus",
    required: true,
  },
  quantity: { type: Number, required: true },
  costPrice: { type: Number, required: true },
  mrp: { type: Number, required: true },

  totalCost: { type: Number, required: true },
  totalMrp: { type: Number, required: true },
});

const franchiseStockTransferSchema = new mongoose.Schema(
  {
    franchise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Franchise",
      required: true,
    },

    items: [transferItemSchema],

    grandTotalCost: { type: Number, required: true },
    grandTotalMrp: { type: Number, required: true },

    transferDate: { type: Date, default: Date.now },

    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = new mongoose.model(
  "FranchiseStockTransfer",
  franchiseStockTransferSchema
);
