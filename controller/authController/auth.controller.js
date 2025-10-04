const modles = require("../../models/index")

const { successResponse, errorResponse, validationError } = require('../../helpers/response.helper');

module.exports = {
    signup: async (req, res) => {
        try {
            const { email, password } = req.body
            if (!email && !password) {
                return validationError(res, "Details are Required")
            }

        } catch (error) {
            console.log(error, "==>")
            return errorResponse(res, error.message, 500, error);

        }
    },
    login: async (req, res) => {
        try {

        } catch (error) {
            return errorResponse(res, 'Server error', 500, error);

        }
    },   
}