
const mongoose = require("mongoose");

const warehouseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    code: {
        type: String,
        unique: true,
        required: false
    },
    address: String,
    location: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point",
        },
        locationName: {
            type: String,
            default: ""
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            default: [0, 0],
        },
    },

    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    documents: {
        aadhaar: {
            number: { type: String, select: false }, // encrypted
            frontImage: { type: String }, // S3 / Cloudinary URL
            backImage: { type: String },
            verified: { type: Boolean, default: false }
        },

        pan: {
            number: { type: String, select: false }, // encrypted
            image: { type: String },
            verified: { type: Boolean, default: false }
        },

        passportPhoto: {
            type: String // image URL
        }
    },

    // =====================
    // Bank Details
    // =====================
    bankDetails: {
        accountHolderName: { type: String },
        accountNumber: { type: String, select: false }, // encrypted
        ifscCode: { type: String },
        bankName: { type: String },
        branchName: { type: String },
        verified: { type: Boolean, default: false }
    },

    isActive: {
        type: Boolean,
        default: true
    }

}, { timestamps: true });

module.exports = mongoose.model("warehouse", warehouseSchema);
