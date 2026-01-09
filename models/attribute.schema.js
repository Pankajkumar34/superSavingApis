const mongoose =require("mongoose")

const attributeSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    categoryType: {
      type: String,
      enum: ["grocery", "electronic"],
      required: true,
    },

    attributes: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Attribute", attributeSchema);
