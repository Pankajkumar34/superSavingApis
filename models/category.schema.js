const mongoose = require("mongoose")

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },

    slug: {
      type: String,
      lowercase: true,
      unique: true
    },

    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand"
    },

    type: {
      type: String,
      enum: ["grocery", "electronics"],
      required: true
    },

    image: {
      type: String
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("category",categorySchema)
