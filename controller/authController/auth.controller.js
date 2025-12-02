const models = require("../../models/index")
const jwt = require("jsonwebtoken");
const { successResponse, errorResponse, validationError, failedErrorResponse } = require('../../helpers/response.helper');

function generateOTP(length = 6) {
    let otp = "";
    const digits = "0123456789";

    for (let i = 0; i < length; i++) {
        otp += digits[Math.floor(Math.random() * 10)]
    }

    return otp;
}



module.exports = {

    signup: async (req, res) => {
        try {
            const {
                firstName,
                lastName,
                email,
                phoneNumber,
                deviceType,
                deviceToken,
                socialLoginType,
                socialLoginId,
            } = req.body;

            if (!firstName || !email) {
                return res.status(400).json({
                    success: false,
                    message: "firstName and email are required",
                });
            }

            const existingUser = await models.userModel.findOne({ email: email.toLowerCase() });
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: "User already exists with this email",
                });
            }
            const user = new models.userModel({
                firstName,
                lastName,
                email: email.toLowerCase(),
                phoneNumber,
                deviceType,
                deviceToken,
                socialLoginType,
                socialLoginId,
                loginTime: new Date(),
                isProfileCompleted: false,
            });
            await user.save();
            return res.status(201).json({
                success: true,
                message: "Signup successful, please complete your profile",
                data: {
                    _id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                    isProfileCompleted: user.isProfileCompleted,
                },
            });
        } catch (error) {
            console.error("SIGNUP_ERROR:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message,
            });
        }
    },
    login: async (req, res) => {
        try {
            const { email } = req.body;

            // Basic validation
            if (!email) {
                return res.status(400).json({
                    success: false,
                    message: "Email is required",
                });
            }

            // Find user
            const user = await models.userModel.findOne({ email: email.toLowerCase() });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found with this email",
                });
            }

            // Create JWT token
            const payload = {
                userId: user._id,
                email: user.email,
                role: user.role,
            };

            const token = jwt.sign(
                payload,
                process.env.JWT_SECRET || "your_jwt_secret_key",
                { expiresIn: "7d" }
            );

            // Update user session fields
            user.authToken = token;
            user.loginTime = new Date();
            user.sessionExpire = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

            await user.save();

            // Send response
            return res.status(200).json({
                success: true,
                message: "Login successful",
                data: {
                    token,
                    user: {
                        _id: user._id,
                        role: user.role,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        phoneNumber: user.phoneNumber,
                        isProfileCompleted: user.isProfileCompleted,
                    },
                },
            });
        } catch (error) {
            return errorResponse(res, "Server error", 500, error);
        }
    },
    completeProfile: async (req, res) => {
        try {
            const { userId } = req.params;
            const {
                location,
                deviceType,
                deviceToken,
                firstName,
                email,
                lastName,
                phoneNumber,
                profilePic,
                address,
                isTerm
            } = req.body;
            const user = await models.userModel.findOne({ _id: userId });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found",
                });
            }
            // update only if values provided
            if (firstName) user.firstName = firstName;
            if (lastName) user.lastName = lastName;
            if (phoneNumber) user.phoneNumber = phoneNumber;
            if (location && Array.isArray(location.coordinates)) {
                user.location = {
                    type: "Point",
                    locationName: location.locationName,
                    coordinates: location.coordinates,
                };
            }
            if (email) user.email = email
            if (deviceType) user.deviceType = deviceType;
            if (deviceToken) user.deviceToken = deviceToken;

            if (profilePic) user.profilePic = profilePic
            if (address) user.address = {
                villageCity: address.villageCity,
                postOffice: address.postOffice,
                district: address.district,
                policeStation: address.policeStation,
                whatsappNumber: address.whatsappNumber,
                state: address.state,
                region: address.region
            };
            if(isTerm) user.isTerm=isTerm
            user.isProfileCompleted = true;

            await user.save();

            return res.status(200).json({
                success: true,
                message: "Profile completed successfully",
                data: user,
            });
        } catch (error) {
            console.error("COMPLETE_PROFILE_ERROR:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message,
            });
        }
    },
    sendOtp: async (req, res) => {
        try {
            const { phoneNumber, countryCode } = req.body;
            const isExistinNumber = await models.userModel.findOne({ phoneNumber: phoneNumber });
            const otp = generateOTP(6);

            if (isExistinNumber) {
                const userData = await models.userModel.findOneAndUpdate({ phoneNumber: phoneNumber }, {
                    $set: {
                        otp: String("123456"),
                        otpExpiry: new Date(Date.now() + 1 * 60 * 1000) // OTP valid for 2 minutes
                    }
                }, { new: true })
                return successResponse(res, "OTP sent successfully", isExistinNumber);
            }
            if (!phoneNumber || !countryCode) return failedErrorResponse(res, "phoneNumber and countryCode are required", 400);

            const userData = await models.userModel.create({
                phoneNumber: phoneNumber,
                countryCode: countryCode,
                otp: String("123456"),
                otpExpiry: new Date(Date.now() + 1 * 60 * 1000) // OTP valid for 2 minutes
            })
            return successResponse(res, "OTP sent successfully", isExistinNumber);

        } catch (error) {
            return errorResponse(res, "Server error", 500, error);
        }
    },
    verifyOtp: async (req, res) => {
        try {
            const { phoneNumber, otp } = req.body;

            const isExistinNumber = await models.userModel.findOne({ phoneNumber: phoneNumber }, { otp: 1, otpExpiry: 1, isOtpVerified: 1 });
            if (!isExistinNumber) {
                return failedErrorResponse(res, "User not found", 400);
            }
            if (new Date(isExistinNumber.otpExpiry) < new Date()) {
                return failedErrorResponse(res, "OTP expired", 400);
            }

            if (isExistinNumber.otp !== otp) {
                return failedErrorResponse(res, "Invalid OTP", 400);
            }

            await models.userModel.updateOne({ _id: isExistinNumber._id }, { isOtpVerified: true })

            const userData = await models.userModel.findOne({ phoneNumber: phoneNumber });

            const accessToken = jwt.sign(
                { userId: userData._id, role: userData.role },
                process.env.JWT_SECRET,
                { expiresIn: "1h" }
            );


            const refreshToken = jwt.sign(
                { userId: userData._id },
                process.env.JWT_REFRESH_SECRET,
                { expiresIn: "365d" }
            );
            userData.refreshTokens.push({ token: refreshToken, deviceType: req.body.deviceType || "web" });

            userData.loginTime = new Date();
            userData.sessionExpire = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

            await userData.save();
            res.cookie("accessToken", accessToken, {
                httpOnly: false,
                secure: true,
                sameSite: "strict",
                maxAge: 60 * 1000, // 1 min
            });
            res.cookie("refreshToken", refreshToken, {
                httpOnly: false,
                secure: true,
                sameSite: "strict",
                maxAge: 24 * 60 * 60 * 1000, // 1 day
            });
            return successResponse(res, "OTP verified successfully", {

                _id: userData?._id,
                emai: userData.email
            });

        } catch (error) {
            return errorResponse(res, "Server error", 500, error);
        }
    },
    refreshToken: async (req, res) => {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                return failedErrorResponse(res, "Token expired. Please login again.", 401);
            }

            let payload;
            try {
                payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
            } catch (err) {
                return failedErrorResponse(res, "Invalid or expired refresh token", 401);
            }

            const user = await models.userModel.findOne({
                _id: payload.userId,
                "refreshTokens.token": refreshToken
            });

            if (!user) {
                return failedErrorResponse(res, "Refresh token not found in DB", 401);
            }

            const newAccessToken = jwt.sign(
                { userId: user._id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: "1m" }
            );
            res.cookie("accessToken", newAccessToken, {
                httpOnly: false,
                secure: true,
                sameSite: "strict",
                maxAge: 60 * 1000, // 1 minute
            });

            return successResponse(res, "Token refreshed", {
                accessToken: newAccessToken,
            });

        } catch (error) {
            return errorResponse(res, "Server error", 500, error);
        }
    },
    me: async (req, res) => {
        try {

            const token = req.cookies.accessToken;
            if (!token) {
                return failedErrorResponse(res, "Unathorized  User", 401);
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await models.userModel.findById(decoded.userId).select("-password");

            if (!user) {
                return failedErrorResponse(res, "Invaild User", 401);
            }

            return res.json({
                loggedIn: true,
                user,
            });
        } catch (error) {
            return errorResponse(res, error.message, 500, error)
        }
    }

}