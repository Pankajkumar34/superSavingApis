const mongoose = require("mongoose");

const skuSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    /* ================= VARIANTS ================= */
    attributes: {
      quantity: { type: Number },
      weight: { type: Number },
      unit: {
        type: String,
        enum: ["g", "kg", "ml", "l", "pcs"],
      },

      // Clothes
      size: { type: String }, // S, M, L, XL
      color: { type: String },

      // Electronics
      storage: { type: String }, // 64GB, 128GB
      ram: { type: String }, // 4GB, 8GB
      model: { type: String },
    },

    /* ================= STATUS ================= */
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    isDefault: {
      type: Boolean,
      default: false, // default SKU for product
    },

    mrp: {
      type: Number,
    },

    costPrice: {
      type: Number,
    },

    discountPercent: {
      type: Number,
      min: 0,
      max: 100,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);
skuSchema.index({ sku: 1 }, { unique: true });
skuSchema.index({ product: 1 });
module.exports = mongoose.model("Sku", skuSchema);
