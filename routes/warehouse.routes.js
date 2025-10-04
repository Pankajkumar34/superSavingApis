const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../middlewares/auth.middleware');

// role 4= warehouseAdmin
router.get('/', verifyToken, verifyRole([4]));

module.exports = router;