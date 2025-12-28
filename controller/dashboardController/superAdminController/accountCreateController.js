
const models = require("../../../models/index");
const { successResponse, failedErrorResponse, errorResponse } = require("../../../helpers/response.helper")
const { generateAccountNumber } = require("../../../utils/accountNumberGenerate");
const { passwordHash } = require("../../../middlewares/auth.middleware");
module.exports = {
    accountCreate: async (req, res) => {
        try {
            const { firstName, countryCode,lastName, email, password, role, phoneNumber } = req.body;
            const existingUser = await models.userModel.findOne({ email: email });
            if (existingUser) {
                return failedErrorResponse(res, "Email already in use", 400);
            }
            const hashedPassword = await passwordHash(password);
            const accountNumber = generateAccountNumber();
            const newUser = await models.userModel.create({
                firstName: firstName,
                lastName: lastName,
                email,
                password: hashedPassword,
                countryCode: countryCode,
                profileImage: "",
                phoneNumber: phoneNumber,
                accountNumber: accountNumber,
                role
            });
            let newAccount;
            if (newUser && role === "FRANCHISE_ADMIN") {
                newAccount = await models.franchise.create({
                    name: `${firstName} ${lastName}`.trim(),
                    owner: newUser._id,
                    code: accountNumber
                })
            }
             if (newUser && role === "WAREHOUSE_ADMIN") {
                newAccount = await models.warehouse.create({
                    name: `${firstName} ${lastName}`.trim(),
                    manager: newUser._id,
                    code: accountNumber
                })
            }
            return successResponse(res, "User created successfully",  { newUser, newAccount },201);
        } catch (error) {
            return errorResponse(res, "Server error", 500, error);

        }
    }
}