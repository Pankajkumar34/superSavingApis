const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../middlewares/auth.middleware');

// role 1 = superAdmin
router.post('/',async()=>{});

module.exports = router;
