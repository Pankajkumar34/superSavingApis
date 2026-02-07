
const mongoose = require("mongoose");


const permissions = new mongoose.Schema({
  role: {
    type: String,
    enum: [
      "SUPER_ADMIN",
      "FRANCHISE_ADMIN",
      "WAREHOUSE_MANAGER",
      "STAFF"
    ],
    required: true,
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  permissions: {
    users: {
      read: { type: Boolean, default: false },
      create: { type: Boolean, default: false },
      update: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    },

    products: {
      read: { type: Boolean, default: false },
      create: { type: Boolean, default: false },
      update: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    },

    inventory: {
      read: { type: Boolean, default: false },
      updateQuantity: { type: Boolean, default: false },
      updatePrice: { type: Boolean, default: false }
    },

    orders: {
      read: { type: Boolean, default: false },
      updateStatus: { type: Boolean, default: false }
    }
  }
}, { timestamps: true });

module.exports = mongoose.model("permissions", permissions);



