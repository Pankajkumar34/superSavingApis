const mongoose = require("mongoose");

const barcodeSchema = new mongoose.Schema(
    {
        inventory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Inventory",
            required: true,
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        sku: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Sku",
            required: true,
        },
        barcode: {
            type: String,
            required: true,
            unique: true,
        },
    },

    { timestamps: true }
);

module.exports = mongoose.model("Barcode", barcodeSchema);