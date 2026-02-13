

const mongoose = require("mongoose")
const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    slug: {
      type: String,
      lowercase: true
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },

    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand"
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
subCategorySchema.index({ name: 1, categoryId: 1 }, { unique: true });
module.exports= mongoose.model("subcategory",subCategorySchema)