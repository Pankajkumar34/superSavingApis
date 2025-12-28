const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../../middlewares/auth.middleware');

// role 3 = frenchies
router.post('/create/frenchies', verifyToken, verifyRole(["SUPER_ADMIN"]),);

module.exports = router;
