const mongoose =require("mongoose")

const brandSchema = new mongoose.Schema(
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

    logo: {
      type: String // image URL (S3 / Cloudinary)
    },

    description: {
      type: String
    },

    country: {
      type: String
    },

    isActive: {
      type: Boolean,
      default: true
    },

    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String]
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin"
    }
  },
  {
    timestamps: true
  }
);


module.exports= mongoose.model("brand",brandSchema)
