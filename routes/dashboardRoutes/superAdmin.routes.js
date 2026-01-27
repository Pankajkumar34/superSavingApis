const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../../middlewares/auth.middleware');
const superAdminController= require('../../controller/dashboardController/superAdminController/accountCreateController');
// role 4 = subAdmin
// router.get('/', verifyToken, verifyRole([4]));
router.post('/create-account', verifyToken, verifyRole(["SUPER_ADMIN"]), superAdminController.accountCreate);
router.get("/stats",verifyToken, verifyRole(["SUPER_ADMIN"]),superAdminController.getUserStats)
router.get("/get-account-details",verifyToken, verifyRole(["SUPER_ADMIN"]),superAdminController.getAccountDataById)

module.exports = router;
