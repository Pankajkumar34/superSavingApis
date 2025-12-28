const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const models = require("../../models/index");
const { successResponse, errorResponse, validationError, failedErrorResponse } = require('../../helpers/response.helper');

module.exports = {
    dashboardlogin: async (req, res) => {
        try {
            const { email, password } = req.body;

            const user = await models.userModel.findOne({ email }).select("+password");

            if (!user) {
                return failedErrorResponse(res, "Invalid credentials", 401);
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return failedErrorResponse(res, "Invalid credentials", 401);
            }

            if (!["SUPER_ADMIN", "FRANCHISE_ADMIN", "WAREHOUSE_ADMIN"].includes(user.role)) {
                return failedErrorResponse(res, "Dashboard access denied", 403);
            }

            const accessToken = jwt.sign(
                {
                    userId: user._id,
                    role: user.role,
                    franchiseId: user.franchiseId,
                    warehouseId: user.warehouseId
                },
                process.env.JWT_SECRET,
                { expiresIn: "15m" }
            );

            const refreshToken = jwt.sign(
                { userId: user._id },
                process.env.JWT_REFRESH_SECRET,
                { expiresIn: "7d" }
            );
            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: true,          // HTTPS only
                sameSite: "strict",    // prevent CSRF
                maxAge: 15 * 60 * 1000 // 15 min
            });
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
            return successResponse(res, "OTP verified successfully", { accessToken, refreshToken, user });
        } catch (error) {
            return errorResponse(res, "Server error", 500, error);
        }
    },
}