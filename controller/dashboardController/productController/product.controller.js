
const { errorResponse, successResponse, failedErrorResponse } = require('../../../helpers/response.helper');
const models = require('../../../models/index');
const mongoose = require("mongoose");
const { getUserPermissions } = require('../../../middlewares/permission.middleware');
const { generateBarcodeImage } = require('../../../utils/barcodeGenerate');

module.exports = {
    addBrand: async (req, res) => {
        try {
            const { brands } = req.body;
            const userId = req.user.userId;

            const permissions = await getUserPermissions(userId);
            if (!permissions || !permissions.products || !permissions.products.create) {
                return failedErrorResponse(res, "Permission denied: You don't have create permission for products", 403);
            }

            if (!Array.isArray(brands) || brands.length === 0) {
                return failedErrorResponse(res, "Brands array required", 400);
            }
            console.log("Received brands:", brands);

            const formattedBrands = brands.map((brand) => ({
                ...brand,
                name: brand.name.trim(),
                slug: brand.slug,
                addedBy: userId
            }));

            const names = formattedBrands.map(b => b.name);
            const existingBrands = await models.brandModel.find({ name: { $in: names } });

            const existingNames = existingBrands.map(b => b.name);

            // 🔹 Filter only new brands
            const newBrands = formattedBrands.filter(
                b => !existingNames.includes(b.name)
            );

            if (newBrands.length === 0) {
                return failedErrorResponse(res, "All brands already exist", 400);
            }

            const savedBrands = await models.brandModel.insertMany(newBrands);

            return successResponse(res, "Brands added successfully", {
                addedCount: savedBrands.length,
                skippedCount: existingNames.length,
                addedBrands: savedBrands
            });

        } catch (error) {
            return errorResponse(res, "Server error", 500, error);
        }
    },
    updateBrand: async (req, res) => {
        try {
            const { brandId } = req.params;
            const { name, slug, logo, description, country, isActive, seo } = req.body;
            const userId = req.user.userId;

            // Check permission
            const permissions = await getUserPermissions(userId);
            if (!permissions || !permissions.products || !permissions.products.update) {
                return failedErrorResponse(res, "Permission denied: You don't have update permission for products", 403);
            }

            const brand = await models.brandModel.findById(brandId);
            if (!brand) {
                return failedErrorResponse(res, "Brand not found", 404);
            }

            if (name && name.trim() !== brand.name) {
                const existingBrand = await models.brandModel.findOne({
                    name: name.trim(),
                    _id: { $ne: brandId }
                });

                if (existingBrand) {
                    return failedErrorResponse(res, "Brand name already exists", 400);
                }

                brand.name = name.trim();
            }

            if (slug) brand.slug = slug;
            if (logo) brand.logo = logo;
            if (description) brand.description = description;
            if (country) brand.country = country;
            if (typeof isActive === "boolean") brand.isActive = isActive;
            if (seo) brand.seo = seo;

            await brand.save();

            return successResponse(res, "Brand updated successfully", brand);
        } catch (error) {
            return errorResponse(res, "Server error", 500, error);
        }
    },
    getBrand: async (req, res) => {
        try {
            const userId = req.user.userId;

            // Check permission
            const permissions = await getUserPermissions(userId);
            if (!permissions || !permissions.products || !permissions.products.read) {
                return failedErrorResponse(res, "Permission denied: You don't have read permission for products", 403);
            }

            const brand = await models.brandModel.find({ isActive: true }).sort({ createdAt: -1 });

            return successResponse(res, "Brand list fetched", brand);
        } catch (error) {
            return errorResponse(res, "Server error", 500, error);
        }

    },
    deleteBrand: async (req, res) => {
        try {
            const { brandId } = req.params;
            const userId = req.user.userId;

            // Check permission
            const permissions = await getUserPermissions(userId);
            if (!permissions || !permissions.products || !permissions.products.delete) {
                return failedErrorResponse(res, "Permission denied: You don't have delete permission for products", 403);
            }

            const brand = await models.brandModel.findById(brandId);
            if (!brand) {
                return failedErrorResponse(res, "Brand not found", 404);
            }

            brand.isActive = false;
            await brand.save();

            return successResponse(res, "Brand deleted successfully", null);
        } catch (error) {
            return errorResponse(res, "Server error", 500, error);
        }
    },
    /// Category Controllers 
    addCategory: async (req, res) => {
        try {
            const { categories } = req.body;
            const userId = req.user.userId;

            // Check permission
            const permissions = await getUserPermissions(userId);
            if (!permissions || !permissions.products || !permissions.products.create) {
                return failedErrorResponse(res, "Permission denied: You don't have create permission for products", 403);
            }

            if (!Array.isArray(categories) || categories.length === 0) {
                return failedErrorResponse(res, "Categories array is required", 400);
            }

            /* ================= PREPARE DATA ================= */
            const names = categories.map(cat => cat.name.trim());

            const existingCategories = await models.categoryModel.find({
                name: { $in: names }
            }).select("name");

            const existingNames = existingCategories.map(
                cat => cat.name.toLowerCase()
            );

            const filteredCategories = categories.filter(
                cat => !existingNames.includes(cat.name.trim().toLowerCase())
            );

            if (filteredCategories.length === 0) {
                return failedErrorResponse(
                    res,
                    "All categories already exist",
                    400
                );
            }

            const payload = filteredCategories.map(cat => ({
                name: cat.name.trim(),
                slug: cat.name.trim().toLowerCase().replace(/\s+/g, "-"),
                brandId: cat.brandId,
                type: cat.type,
                image: cat.image || "",
            }));

            /* ================= INSERT ================= */
            const savedCategories = await models.categoryModel.insertMany(
                payload,
                { ordered: false } // ⚡ continue even if one fails
            );

            return successResponse(
                res,
                "Categories added successfully",
                savedCategories
            );

        } catch (error) {
            console.error("Add Category Multiple Error:", error);
            return errorResponse(res, "Server error", 500, error);
        }
    },

    getCategories: async (req, res) => {
        try {
            const userId = req.user.userId;

            // Check permission
            const permissions = await getUserPermissions(userId);
            if (!permissions || !permissions.products || !permissions.products.read) {
                return failedErrorResponse(res, "Permission denied: You don't have read permission for products", 403);
            }

            const categories = await models.categoryModel
                .find({ isActive: true })
                .sort({ createdAt: -1 });

            return successResponse(res, "Category list fetched", categories);
        } catch (error) {
            return errorResponse(res, "Server error", 500, error);
        }
    },
    getCategoryById: async (req, res) => {
        try {
            const { categoryId } = req.params;
            const userId = req.user.userId;

            // Check permission
            const permissions = await getUserPermissions(userId);
            if (!permissions || !permissions.products || !permissions.products.read) {
                return failedErrorResponse(res, "Permission denied: You don't have read permission for products", 403);
            }

            const category = await models.categoryModel
                .findById(categoryId)
                .populate("brand", "name slug");

            if (!category) {
                return failedErrorResponse(res, "Category not found", 404);
            }

            return successResponse(res, "Category fetched successfully", category);
        } catch (error) {
            return errorResponse(res, "Server error", 500, error);
        }
    },
    updateCategory: async (req, res) => {
        try {
            const { categoryId } = req.params;
            const { name, slug, brand, type, image, isActive } = req.body;
            const userId = req.user.userId;

            // Check permission
            const permissions = await getUserPermissions(userId);
            if (!permissions || !permissions.products || !permissions.products.update) {
                return failedErrorResponse(res, "Permission denied: You don't have update permission for products", 403);
            }

            const category = await models.categoryModel.findById(categoryId);
            if (!category) {
                return failedErrorResponse(res, "Category not found", 404);
            }

            // Name duplicate check
            if (name && name.trim() !== category.name) {
                const exists = await models.categoryModel.findOne({
                    name: name.trim(),
                    _id: { $ne: categoryId }
                });

                if (exists) {
                    return failedErrorResponse(res, "Category name already exists", 400);
                }

                category.name = name.trim();
            }

            if (slug) category.slug = slug;
            if (brand) category.brand = brand;
            if (type) category.type = type;
            if (image) category.image = image;
            if (typeof isActive === "boolean") category.isActive = isActive;

            await category.save();

            return successResponse(res, "Category updated successfully", category);
        } catch (error) {
            return errorResponse(res, "Server error", 500, error);
        }
    },
    deleteCategory: async (req, res) => {
        try {
            const { categoryId } = req.params;
            const userId = req.user.userId;

            // Check permission
            const permissions = await getUserPermissions(userId);
            if (!permissions || !permissions.products || !permissions.products.delete) {
                return failedErrorResponse(res, "Permission denied: You don't have delete permission for products", 403);
            }

            const category = await models.categoryModel.findById(categoryId);
            if (!category) {
                return failedErrorResponse(res, "Category not found", 404);
            }

            category.isActive = false;
            await category.save();

            return successResponse(res, "Category deleted successfully", null);
        } catch (error) {
            return errorResponse(res, "Server error", 500, error);
        }
    },

    /* =========================
         ADD SUBCATEGORY
      ========================= */
    addSubCategory: async (req, res) => {
        try {
            const { subCategories } = req.body;
            const userId = req.user.userId;

            // Check permission
            const permissions = await getUserPermissions(userId);
            if (!permissions || !permissions.products || !permissions.products.create) {
                return failedErrorResponse(res, "Permission denied: You don't have create permission for products", 403);
            }

            if (!Array.isArray(subCategories) || subCategories.length === 0) {
                return failedErrorResponse(
                    res,
                    "SubCategories array is required",
                    400
                );
            }

            /* ================= CLEAN & PREPARE DATA ================= */
            const preparedData = subCategories.map((item) => {
                if (!item.name || !item.categoryId) {
                    throw new Error("Name and categoryId are required");
                }

                return {
                    name: item.name.trim(),
                    slug: item.name.trim().toLowerCase().replace(/\s+/g, "-"),
                    categoryId: item.categoryId,
                    brandId: item.brandId || null,
                    image: item.image || null,
                    isActive:
                        typeof item.isActive === "boolean"
                            ? item.isActive
                            : true,
                };
            });

            /* ================= DUPLICATE CHECK ================= */
            const existing = await models.subcategoryModel.find({
                $or: preparedData.map((item) => ({
                    name: item.name,
                    categoryId: item.categoryId,
                })),
            });

            if (existing.length > 0) {
                return failedErrorResponse(
                    res,
                    "One or more subcategories already exist",
                    400
                );
            }

            /* ================= INSERT ================= */
            const createdSubCategories =
                await models.subcategoryModel.insertMany(preparedData);

            return successResponse(
                res,
                "Subcategories added successfully",
                createdSubCategories
            );
        } catch (error) {
            console.error(error);
            return errorResponse(res, error.message || "Server error", 500);
        }
    },

    getSubCategories: async (req, res) => {
        try {
            const userId = req.user.userId;

            // Check permission
            const permissions = await getUserPermissions(userId);
            if (!permissions || !permissions.products || !permissions.products.read) {
                return failedErrorResponse(res, "Permission denied: You don't have read permission for products", 403);
            }

            const subCategories = await models.subcategoryModel
                .find({ isActive: true })
                .populate("category", "name slug")
                .populate("brand", "name slug")
                .sort({ createdAt: -1 });

            return successResponse(
                res,
                "Subcategory list fetched",
                subCategories
            );
        } catch (error) {
            return errorResponse(res, "Server error", 500, error);
        }
    },


    getSubCategoryById: async (req, res) => {
        try {
            const { subCategoryId } = req.params;
            const userId = req.user.userId;

            // Check permission
            const permissions = await getUserPermissions(userId);
            if (!permissions || !permissions.products || !permissions.products.read) {
                return failedErrorResponse(res, "Permission denied: You don't have read permission for products", 403);
            }

            const subCategory = await models.subcategoryModel
                .findById(subCategoryId)
                .populate("category", "name slug")
                .populate("brand", "name slug");

            if (!subCategory) {
                return failedErrorResponse(res, "Subcategory not found", 404);
            }

            return successResponse(
                res,
                "Subcategory fetched successfully",
                subCategory
            );
        } catch (error) {
            return errorResponse(res, "Server error", 500, error);
        }
    },


    updateSubCategory: async (req, res) => {
        try {
            const { subCategoryId } = req.params;
            const { name, slug, category, brand, image, isActive } = req.body;
            const userId = req.user.userId;

            // Check permission
            const permissions = await getUserPermissions(userId);
            if (!permissions || !permissions.products || !permissions.products.update) {
                return failedErrorResponse(res, "Permission denied: You don't have update permission for products", 403);
            }

            const subCategory = await models.subcategoryModel.findById(subCategoryId);
            if (!subCategory) {
                return failedErrorResponse(res, "Subcategory not found", 404);
            }

            // Duplicate name check (same category)
            if (name && name.trim() !== subCategory.name) {
                const exists = await models.subcategoryModel.findOne({
                    name: name.trim(),
                    category: category || subCategory.category,
                    _id: { $ne: subCategoryId }
                });

                if (exists) {
                    return failedErrorResponse(res, "Subcategory name already exists", 400);
                }

                subCategory.name = name.trim();
            }

            if (slug) subCategory.slug = slug;
            if (category) subCategory.category = category;
            if (brand) subCategory.brand = brand;
            if (image) subCategory.image = image;
            if (typeof isActive === "boolean") subCategory.isActive = isActive;

            await subCategory.save();

            return successResponse(
                res,
                "Subcategory updated successfully",
                subCategory
            );
        } catch (error) {
            return errorResponse(res, "Server error", 500, error);
        }
    },


    deleteSubCategory: async (req, res) => {
        try {
            const { subCategoryId } = req.params;
            const userId = req.user.userId;

            // Check permission
            const permissions = await getUserPermissions(userId);
            if (!permissions || !permissions.products || !permissions.products.delete) {
                return failedErrorResponse(res, "Permission denied: You don't have delete permission for products", 403);
            }

            const subCategory = await models.subcategoryModel.findById(subCategoryId);
            if (!subCategory) {
                return failedErrorResponse(res, "Subcategory not found", 404);
            }

            subCategory.isActive = false;
            await subCategory.save();

            return successResponse(
                res,
                "Subcategory deleted successfully",
                null
            );
        } catch (error) {
            return errorResponse(res, "Server error", 500, error);
        }
    },

    getCatalogTree: async (req, res) => {
        try {
            const userId = req.user.userId;

            // Check permission
            const permissions = await getUserPermissions(userId);
            if (!permissions || !permissions.products || !permissions.products.read) {
                return failedErrorResponse(res, "Permission denied: You don't have read permission for products", 403);
            }

            const brands = await models.brandModel
                .find({ isActive: true })
                .select("_id name");

            const categories = await models.categoryModel
                .find({ isActive: true })
                .select("_id name brandId");

            const subCategories = await models.subcategoryModel
                .find({ isActive: true })
                .select("_id name categoryId");

            const tree = brands.map((brand) => ({
                ...brand.toObject(),
                categories: categories
                    .filter(
                        (cat) => cat.brandId?.toString() === brand._id.toString()
                    )
                    .map((cat) => ({
                        ...cat.toObject(),
                        subCategories: subCategories.filter(
                            (sub) =>
                                sub.categoryId?.toString() ===
                                cat._id.toString()
                        ),
                    })),
            }));

            return successResponse(res, "Catalog tree fetched", tree);

        } catch (error) {
            return errorResponse(res, "Server error", 500, error);
        }

    },

    // product add 

    createProduct: async (req, res) => {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const userId = req.user.userId;

            // Check permission - according to user permissions, they CAN create products
            const permissions = await getUserPermissions(userId);
            if (!permissions || !permissions.products || !permissions.products.create) {
                return failedErrorResponse(res, "Permission denied: You don't have create permission for products", 403);
            }

            const { product, skus, inventory } = req.body;

            /* ================= PRODUCT ================= */
            const slug = product.name
                .trim()
                .toLowerCase()
                .replace(/\s+/g, "-");

            const createdProduct = await models.productModel.create(
                [{ ...product, slug }],
                { session }
            );

            const productId = createdProduct[0]._id;

            /* ================= SKUS ================= */
            const skuDocs = skus.map((sku) => ({
                ...sku,
                product: productId,
            }));

            const createdSkus = await models.skuModel.insertMany(skuDocs, { session });

            const skuMap = {};
            createdSkus.forEach((s) => {
                skuMap[s.sku] = s._id;
            });
            /* ================= INVENTORY ================= */
            const inventoryDocs = inventory.map((inv) => {

                if (!skuMap[inv.sku]) {
                    throw new Error(`SKU mismatch: ${inv.sku} not found in created SKUs`);
                }

                return {
                    product: productId,
                    skuId: skuMap[inv.sku],
                    warehouse: inv.warehouse,
                    quantity: inv.quantity,
                    costPrice: inv.costPrice,
                    batchNumber: inv.batchNumber,
                    manufactureDate: inv.manufactureDate,
                    expiryDate: inv.expiryDate,
                    status: inv.quantity > 0 ? "active" : "out_of_stock",
                };
            });

            const createdInventory = await models.inventoryModel.insertMany(inventoryDocs, { session });
            const barcodeDocs = [];

            for (const inv of createdInventory) {

                const barcodeValue = await generateBarcodeImage(inv._id);

                barcodeDocs.push({
                    product: productId,
                    sku: inv.skuId,
                    inventory: inv._id,
                    barcode: barcodeValue,
                });
            }

            await models.barcodeModel.insertMany(barcodeDocs, { session });
            await session.commitTransaction();
            session.endSession();

            return res.status(201).json({
                success: true,
                message: "Product created successfully",
                productId,
            });

        } catch (error) {
            await session.abortTransaction();
            session.endSession();

            console.error(error);
            return res.status(500).json({
                success: false,
                message: "Product creation failed",
                error: error.message,
            });
        }
    },


    createProducttest: async (req, res) => {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {

            const products = [];
            const skus = [];
            const inventory = [];

            for (let i = 1; i <= 500; i++) {

                const productId = new mongoose.Types.ObjectId();

                // PRODUCT
                products.push({
                    _id: productId,
                    name: `Test Product ${i}`,
                    slug: `test-product-${i}`,
                    brand: "69886e2149c44673927fc90e",
                    category: "698871f349c44673927fc919",
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    images: [
                        {
                            url: `https://uiouoapgdjawmmvsnvxr.supabase.co/storage/v1/object/public/super%20saving%20market/b2559d22-05b7-4046-a2a4-bb9ff4395ffd.png`,
                            isPrimary: true,
                            altText: `Image of Test Product ${i}`
                        }
                    ],
                    description: `Description for Test Product ${i}`,
                    isFeatured: i % 10 === 0

                });

                for (let j = 1; j <= 2; j++) {

                    const skuId = new mongoose.Types.ObjectId();
                    const skuCode = `SKU-${i}-${j}`;

                    // SKU
                    skus.push({
                        _id: skuId,
                        product: productId,
                        sku: skuCode,
                        mrp: 100 + j,
                        costPrice: 90 + j,
                        isActive: true,
                        price: 90 + j,
                        stock: 50,

                    });

                    // INVENTORY
                    inventory.push({
                        product: productId,
                        sku: skuId,
                        warehouse: "698f612e83fc5ecf8e5fb1a2",
                        quantity: 50,
                        costPrice: 70,
                        batchNumber: `BATCH-${i}-${j}`,
                        expiryDate: new Date(),
                        status: "active"
                    });
                }
            }

            // BULK INSERT
            await models.productModel.insertMany(products, { session });
            await models.skuModel.insertMany(skus, { session });
            await models.inventoryModel.insertMany(inventory, { session });

            await session.commitTransaction();
            session.endSession();

            return res.status(201).json({
                success: true,
                message: "500 products created successfully",
                productCount: products.length
            });

        } catch (error) {
            await session.abortTransaction();
            session.endSession();

            return res.status(500).json({
                success: false,
                message: "Bulk creation failed",
                error: error.message
            });
        }
    },

    getProducts: async (req, res) => {
        try {
            const { cursor, limit = 20 } = req.query;
            const userId = req.user.userId;
            // const permissions = await getUserPermissions(userId);
            // if (!permissions || !permissions.products || !permissions.products.read) {
            //     return failedErrorResponse(res, "Permission denied: You don't have read permission for products", 403);
            // }
            const matchStage = {};

            // Cursor pagination (based on _id)
            if (cursor) {
                matchStage._id = { $lt: new mongoose.Types.ObjectId(cursor) };
            }

            const products = await models.productModel.aggregate([

                { $match: matchStage },

                { $sort: { _id: -1 } },

                { $limit: Number(limit) },

                {
                    $lookup: {
                        from: "brands",
                        localField: "brand",
                        foreignField: "_id",
                        pipeline: [{ $project: { name: 1 } }],
                        as: "brand"
                    }
                },
                { $unwind: { path: "$brand", preserveNullAndEmptyArrays: true } },

                {
                    $lookup: {
                        from: "categories",
                        localField: "category",
                        foreignField: "_id",
                        pipeline: [{ $project: { name: 1 } }],
                        as: "category"
                    }
                },
                { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: "subcategories",
                        localField: "categoryId",
                        foreignField: "category._id",
                        pipeline: [{ $project: { name: 1 } }],
                        as: "subcategory"
                    }
                },
                { $unwind: { path: "$subcategory", preserveNullAndEmptyArrays: true } },

                {
                    $lookup: {
                        from: "skus",
                        localField: "_id",
                        foreignField: "product",
                        pipeline: [
                            {
                                $project: {
                                    sku: 1,
                                    mrp: 1,
                                    price: 1,
                                    stock: 1,
                                    sellingPrice: 1,
                                    isActive: 1
                                }
                            }
                        ],
                        as: "skus"
                    }
                },

                // 5️⃣ FINAL PROJECT
                {
                    $project: {
                        name: 1,
                        slug: 1,
                        images: 1,
                        isActive: 1,
                        createdAt: 1,
                        totalStock: 1,
                        subcategory: 1,
                        brand: 1,
                        category: 1,
                        skus: 1
                    }
                }

            ]);

            const nextCursor = products.length
                ? products[products.length - 1]._id
                : null;

            return res.status(200).json({
                success: true,
                data: products,
                nextCursor
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch products",
                error: error.message
            });
        }
    },
    transferStockToFranchise: async (req, res) => {
        try {
            const { franchiseId, warehouseId, items } = req.body;
            const userId = req.user.userId;

            console.log("Transfer Request:", { franchiseId, warehouseId, items, userId });

            // const permissions = await getUserPermissions(userId);
            // if (!permissions || !permissions.products || !permissions.products.create) {
            //     return failedErrorResponse(
            //         res,
            //         "Permission denied: You don't have permission",
            //         403
            //     );
            // }

            let grandTotalCost = 0;
            let grandTotalMrp = 0;
            const transferItems = [];

            for (const item of items) {

                // 🔹 1. Get SKU
                const sku = await models.skuModel.findById(item.skuId);
                if (!sku) {
                    return res.status(404).json({ message: "SKU not found" });
                }



                // 🔹 2. Find Warehouse Inventory (IMPORTANT FIX)
                const inventory = await models.inventoryModel.findOne({
                    warehouse: new mongoose.Types.ObjectId(warehouseId),
                    skuId: new mongoose.Types.ObjectId(item.skuId),
                });
                console.log("Inventory Check:", { warehouseId, skuId: item.skuId, inventory });
                if (!inventory) {
                    return res.status(404).json({ message: "Inventory not found in warehouse" });
                }

                if (inventory.quantity < item.quantity) {
                    return res.status(400).json({
                        message: `Not enough quantity in warehouse inventory`,
                    });
                }

                const totalCost = inventory.costPrice * item.quantity;
                const totalMrp = sku.price * item.quantity;

                grandTotalCost += totalCost;
                grandTotalMrp += totalMrp;

                await sku.save();

                inventory.quantity -= item.quantity;

                inventory.stockHistory.push({
                    type: "OUT",
                    quantity: item.quantity,
                    reference: franchiseId,
                    note: `Transferred to franchise`,
                    date: new Date(),
                });

                await inventory.save();

                transferItems.push({
                    product: inventory.product,
                    skuId: item.skuId,
                    quantity: item.quantity,
                    costPrice: inventory.costPrice,
                    mrp: sku.price,
                    totalCost,
                    totalMrp,
                });
            }

            const transfer = await models.franchiseStockTransferModel.create({
                franchise: franchiseId,
                warehouseId: warehouseId,
                items: transferItems,
                grandTotalCost,
                grandTotalMrp,
            });

            return res.status(201).json({
                message: "Stock transferred successfully",
                transfer,
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: error.message,
                error,
            });
        }
    }








}