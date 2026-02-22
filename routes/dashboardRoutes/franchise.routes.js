const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../../middlewares/auth.middleware');
const franchiseController = require('../../controller/dashboardController/franchiseController/franchiseController');
router.post('/customer/create', verifyToken, franchiseController.customerCreate);
module.exports = router;
