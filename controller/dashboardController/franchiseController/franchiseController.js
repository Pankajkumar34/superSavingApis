const { failedErrorResponse } = require("../../../helpers/response.helper");
const { passwordHash } = require("../../../middlewares/auth.middleware");
const { getUserPermissions } = require("../../../middlewares/permission.middleware");
const model = require("../../../models/index");
const { getRoleBaseFilter } = require("../../../service/roleFilter");
const { getUserStatsService } = require("../../../service/userStats.service");
const { generateAccountNumber } = require("../../../utils/accountNumberGenerate");

module.exports = {
    customerCreate: async (req, res) => {
        try {
            const { firstName, lastName, email, password, phoneNumber } = req.body;
            const permissions = await getUserPermissions(req.user.userId);
            console.log("User permissions in customerCreate:",permissions);
            if (!permissions || !permissions.users || !permissions.users.create) {
                return failedErrorResponse(res, "Permission denied: You don't have create permission for users", 403);
            }

            const existingUser = await model.userModel.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: "Email already exists" });
            }
            const hashedPassword = await passwordHash(password);
            const accountNumber = generateAccountNumber();
            const newUser = await model.userModel({
                firstName,
                franchiseId: req.user.userId,
                lastName,
                email,
                phoneNumber,
                role: "USER",
                password: hashedPassword,
                accountNumber: accountNumber,
            });
            await newUser.save();
            res.status(201).json({ message: "Customer created successfully", user: newUser });
        }
        catch (error) {
            console.error("Error creating customer:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },
   
}