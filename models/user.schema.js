const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcryptjs");

const refreshTokenSchema = new Schema({
  token: { type: String, required: true },
  deviceType: { type: String, enum: ["android", "ios", "web"], default: "web" },
  createdAt: { type: Date, default: Date.now },
});




const userSchema = new Schema(
  {
    authSteps: {
      type: Number,
      default: 0,
      enum: [0, 1, 2, 3, 4], // 0: OTP verified, 1: personal details, 2: address, 3: profile complete
    },
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    email: {
      type: String,
      lowercase: true,
      default: "",
    },
    role: {
      type: Number,
      enum: [0, 1, 2, 3, 4], // 0=user, 1=superAdmin, 2=subAdmin, 3=franchise, 4=warehouseAdmin
      default: 0,
    },
    password: { type: String, select: false },
    socialLoginType: {
      type: String,
      enum: ["otp", "google", "facebook", "email-password"],
      default: "otp",
    },
    socialLoginId: { type: String, default: null },
    phoneNumber: { type: String, required: true },
    countryCode: { type: String, default: "+91" },
    isOtpVerified: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    otp: { type: String, select: false },
    otpExpiry: { type: Date, select: false },
    profilePic: { type: String, default: "" },
    isTerm: {
      type: Boolean,
      default: false
    },
    address: {
      villageCity: String,
      postOffice: String,
      district: String,
      policeStation: String,
      whatsappNumber: String,
      state: String,
      region: String
    },
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
    deviceType: {
      type: String,
      enum: ["android", "ios", "web"],
    },

    deviceToken: { type: String, default: "" },
    isProfileCompleted: { type: Boolean, default: false },

    // Multi-device refresh tokens
    refreshTokens: [refreshTokenSchema],

    loginTime: { type: Date },
    sessionExpire: { type: Date },
  },
  { timestamps: true }
);

userSchema.index({ location: "2dsphere" });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Password compare method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Optional: remove sensitive fields when returning JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.otp;
  delete obj.otpExpiry;
  delete obj.refreshTokens;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
