const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  firstName: {
    type: String,
    trim: true,
  },
  lastName: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    sparse: true, 
    lowercase: true,
    trim: true,
  },

  role: {
    type: Number,
    enum: [0, 1, 2, 3, 4], // 0=user, 1=superAdmin, 2=subAdmin, 3=franchise, 4=warehouseAdmin
    default: 0,
  },

  password: {
    type: String,
    select: false, 
  },
  loginType: {
    type: String,
    enum: ["otp", "google", "facebook", "email-password"],
    default: "otp",
  },
  googleId: { type: String, default: null },
  facebookId: { type: String, default: null },

  phoneNumber: {
    type: String,
    required: true,
    unique: true, 
  },
  otp: { type: String, select: false },
  otpExpiry: { type: Date, select: false },
  isVerified: {
    type: Boolean,
    default: false, 
  },

  profilePic: {
    type: String,
    default: "",
  },

  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0],
    },
  },
}, { timestamps: true });

userSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("User", userSchema);
