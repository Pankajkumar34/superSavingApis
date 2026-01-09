const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../../middlewares/auth.middleware');
const productController = require('../../controller/dashboardController/productController/product.controller');
// role 4= warehouseAdmin
router.get('/', verifyToken, verifyRole(["WAREHOUSE_ADMIN"]));
router.post("/brand",verifyToken, verifyRole(["WAREHOUSE_ADMIN"]), productController.addBrand);
router.put("/brand/:brandId",verifyToken, verifyRole(["WAREHOUSE_ADMIN"]), productController.updateBrand);
router.delete("/brand/:brandId", verifyToken, verifyRole(["WAREHOUSE_ADMIN"]),productController.deleteBrand);
/// categories routes 
router.post("/category",verifyToken, verifyRole(["WAREHOUSE_ADMIN"]), productController.addCategory);
router.get("/category",verifyToken, verifyRole(["WAREHOUSE_ADMIN"]), productController.getCategories);
router.get("/category/:categoryId",verifyToken, verifyRole(["WAREHOUSE_ADMIN"]), productController.getCategoryById);
router.put("/category/:categoryId",verifyToken, verifyRole(["WAREHOUSE_ADMIN"]), productController.updateCategory);
router.delete("/category/:categoryId", verifyToken, verifyRole(["WAREHOUSE_ADMIN"]), productController.deleteCategory);
/// sub categories routes 

router.post("/subcategory", verifyToken, verifyRole(["WAREHOUSE_ADMIN"]), productController.addSubCategory);
router.get("/subcategory", verifyToken, verifyRole(["WAREHOUSE_ADMIN"]), productController.getSubCategories);
router.get("/subcategory/:subCategoryId", verifyToken, verifyRole(["WAREHOUSE_ADMIN"]), productController.getSubCategoryById);
router.put("/subcategory/:subCategoryId", verifyToken, verifyRole(["WAREHOUSE_ADMIN"]), productController.updateSubCategory);
router.delete("/subcategory/:subCategoryId", verifyToken, verifyRole(["WAREHOUSE_ADMIN"]), productController.deleteSubCategory);
module.exports = router;