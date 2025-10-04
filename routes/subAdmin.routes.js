const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../middlewares/auth.middleware');

// role 3 = frenchies
router.get('/', verifyToken, verifyRole([3]));

module.exports = router;
