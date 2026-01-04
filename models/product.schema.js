
const mongoose = require("mongoose")

const productImageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true
    },

    isPrimary: {
      type: Boolean,
      default: false
    },
    altText: {
      type: String
    }
  },
  { _id: false }
);


const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true
    },

    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },

    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory"
    },

  
    images: [productImageSchema],


    price: {
      mrp: Number,
      sellingPrice: Number
    },

    stock: {
      type: Number,
      default: 0
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);


module.exports = mongoose.model("product",productSchema)