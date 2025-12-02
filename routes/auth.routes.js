const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../middlewares/auth.middleware');
const authController = require("../controller/authController/auth.controller")
// role 1 = superAdmin
router.post('/signup',authController.signup);
router.post('/send-otp',authController.sendOtp);
router.post('/verify-otp',authController.verifyOtp);
router.post('/complete-profile/:userId',verifyToken, authController.completeProfile);
router.post("/refresh-token", authController.refreshToken);
router.get("/me", authController.me);

module.exports = router;
