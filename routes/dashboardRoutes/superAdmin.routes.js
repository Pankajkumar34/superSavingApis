const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../../middlewares/auth.middleware');
const superAdminController= require('../../controller/dashboardController/superAdminController/accountCreateController');
const productController = require("../../controller/dashboardController/productController/product.controller")
// role 4 = subAdmin
// router.get('/', verifyToken, verifyRole([4]));
router.post('/create-account', verifyToken, verifyRole(["SUPER_ADMIN"]), superAdminController.accountCreate);
router.get("/stats",verifyToken, superAdminController.getUserStats)
router.get("/get-account-details",verifyToken, verifyRole(["SUPER_ADMIN"]),superAdminController.getAccountDataById)
router.get("/get-user-list",verifyToken, verifyRole(["SUPER_ADMIN"]),superAdminController.getUserList)
router.post("/allow-permission",verifyToken, verifyRole(["SUPER_ADMIN"]),superAdminController.permissionCreateAndUpdate)
router.get("/get-permission",verifyToken, verifyRole(["SUPER_ADMIN"]),superAdminController.getPermission)


// product
router.post("/add-brand",verifyToken, productController.addBrand)
router.get("/get-brand-list",verifyToken,productController.getBrand)
router.post("/add-category",verifyToken,productController.addCategory)
router.get("/get-category-list",verifyToken,productController.getCategories)
router.post("/add-sub-category",verifyToken,productController.addSubCategory)
router.get("/catalog-tree",verifyToken,productController.getCatalogTree)
router.post("/create-product",verifyToken,productController.createProduct)
router.get("/get-product-list",verifyToken,productController.getProducts)
router.post("/add-brand",verifyToken, productController.addBrand)
router.post("/transfer-stock",verifyToken, productController.transferStockToFranchise)
module.exports = router;
