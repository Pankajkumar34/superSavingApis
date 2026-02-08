const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../../middlewares/auth.middleware');
const superAdminController= require('../../controller/dashboardController/superAdminController/accountCreateController');
const productController = require("../../controller/dashboardController/productController/product.controller")
// role 4 = subAdmin
// router.get('/', verifyToken, verifyRole([4]));
router.post('/create-account', verifyToken, verifyRole(["SUPER_ADMIN"]), superAdminController.accountCreate);
router.get("/stats",verifyToken, verifyRole(["SUPER_ADMIN"]),superAdminController.getUserStats)
router.get("/get-account-details",verifyToken, verifyRole(["SUPER_ADMIN"]),superAdminController.getAccountDataById)
router.get("/get-user-list",verifyToken, verifyRole(["SUPER_ADMIN"]),superAdminController.getUserList)
router.post("/allow-permission",verifyToken, verifyRole(["SUPER_ADMIN"]),superAdminController.permissionCreateAndUpdate)
router.get("/get-permission",verifyToken, verifyRole(["SUPER_ADMIN"]),superAdminController.getPermission)


// product
router.post("/add-brand",verifyToken, verifyRole(["SUPER_ADMIN"]),productController.addBrand)
router.get("/get-brand-list",verifyToken, verifyRole(["SUPER_ADMIN"]),productController.getBrand)
router.post("/add-category",verifyToken, verifyRole(["SUPER_ADMIN"]),productController.addCategory)
router.get("/get-category-list",verifyToken, verifyRole(["SUPER_ADMIN"]),productController.getCategories)
router.post("/add-sub-category",verifyToken, verifyRole(["SUPER_ADMIN"]),productController.addSubCategory)
router.get("/catalog-tree",verifyToken, verifyRole(["SUPER_ADMIN"]),productController.getCatalogTree)
router.post("/create-product",verifyToken, verifyRole(["SUPER_ADMIN"]),productController.createProduct)
router.get("/get-product-list",verifyToken, verifyRole(["SUPER_ADMIN"]),productController.getProducts)
module.exports = router;
