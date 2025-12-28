
const mongoose = require("mongoose");

const franchiseSchema = new mongoose.Schema({
  name: {
    type: String,
    default: ""
  },

  code: {
    type: String,
    unique: true,
    default:""
  },

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  isActive: {
    type: Boolean,
    default: true
  },

  // =====================
  // Government Documents
  // =====================
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
  }

}, { timestamps: true });


module.exports = mongoose.model("franchise", franchiseSchema);
