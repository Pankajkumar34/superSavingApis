
const express = require('express');
const router = express();


router.use('/api/auth', require('./auth.routes'));
router.use('/api/dashboard', require('./dashboardRoutes/dashboardAuth.routes'));
router.use('/api/super-admin', require('./dashboardRoutes/superAdmin.routes'));
router.use('/api/franchise', require('./dashboardRoutes/franchise.routes'));
router.use('/api/sub-admin', require('./dashboardRoutes/subAdmin.routes'));
router.use('/api/warehouse', require('./dashboardRoutes/warehouse.routes'));

module.exports = router;