
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
    description: {
      type: String,
      trim: true
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    isTrending: {
      type: Boolean,
      default: false
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    reviewsCount: {
      type: Number,
      min: 0,
      max: 10000,
      default: 0
    },
    totalSold: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

productSchema.index({ slug: 1 }, { unique: true });

// 2️⃣ Name search (prefix search support)
productSchema.index({ name: 1 });

// 3️⃣ Category listing (Most Important Index)
productSchema.index({
  category: 1,
  isActive: 1,
  createdAt: -1
});

// 4️⃣ Brand filter
productSchema.index({
  brand: 1,
  isActive: 1
});

// 5️⃣ Featured products (Homepage)
productSchema.index({
  isFeatured: 1,
  isActive: 1,
  createdAt: -1
});

// 6️⃣ Trending products
productSchema.index({
  isTrending: 1,
  isActive: 1,
  createdAt: -1
});

// 7️⃣ Rating sorting
productSchema.index({ rating: -1 });

// 8️⃣ Popular products
productSchema.index({ totalSold: -1 });

// Optional: Unique product per brand + category (better than name+category only)
productSchema.index(
  { name: 1, brand: 1, category: 1 },
  { unique: true }
);

module.exports = mongoose.model("product", productSchema)