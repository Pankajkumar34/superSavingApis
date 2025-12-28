const express = require('express');
const router = express.Router();
const dashboardController = require('../../controller/dashboardController/auth.controller');
const { verifyToken, verifyRole } = require('../../middlewares/auth.middleware');

// role 3 = frenchies
router.post('/login',dashboardController.dashboardlogin );

module.exports = router;
