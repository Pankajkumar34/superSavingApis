const mongoose = require("mongoose");
const inventorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },

    variant: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",required: true
    },

    quantity: {
      type: Number,
      default: 0
    },

    reservedQty: {
      type: Number,
      default: 0
    },

    costPrice: {
      type: Number
    },

    sellingPrice: {
      type: Number
    },

    // Grocery specific
    batchNumber: {
      type: String
    },

    manufactureDate: {
      type: Date
    },

    expiryDate: {
      type: Date
    },

    // Electronics specific
    serialNumbers: [
      {
        type: String
      }
    ],

    // Inventory movement tracking
    stockHistory: [
      {
        type: {
          type: String,
          enum: ["IN", "OUT", "RETURN", "DAMAGE", "ADJUST"],
          required: true
        },
        quantity: Number,
        reference: String, // orderId / returnId
        note: String,
        date: {
          type: Date,
          default: Date.now
        }
      }
    ],

    status: {
      type: String,
      enum: ["active", "out_of_stock", "expired", "damaged"],
      default: "active"
    }
  },
  { timestamps: true }
);
inventorySchema.index({ warehouse: 1 });
inventorySchema.index({ product: 1 });
module.exports = mongoose.model("inventory", inventorySchema)