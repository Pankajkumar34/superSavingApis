const mongoose = require("mongoose");


const inventoryHistorySchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    sku: { type: mongoose.Schema.Types.ObjectId, ref: "Sku" },
    inventory: { type: mongoose.Schema.Types.ObjectId, ref: "Inventory" },

    oldPrice: Number,
    newPrice: Number,

    changedAt: {
        type: Date,
        default: Date.now
    },

    changedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
},{ timestamps: true });

module.exports = mongoose.model("inventoryHistory", inventoryHistorySchema);