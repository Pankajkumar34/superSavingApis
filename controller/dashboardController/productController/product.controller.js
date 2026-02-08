
const { errorResponse, successResponse, failedErrorResponse } = require('../../../helpers/response.helper');
const models = require('../../../models/index');
const mongoose = require("mongoose");
module.exports = {
    addBrand: async (req, res) => {
        try {
            const { brands } = req.body;
            const userId = req.user.userId;
            if (!Array.isArray(brands) || brands.length === 0) {
                return failedErrorResponse(res, "Brands array required", 400);
            }
            console.log("Received brands:", brands);

            // 🔹 Create slug + trim name
            const formattedBrands = brands.map((brand) => ({
                ...brand,
                name: brand.name.trim(),
                slug: brand.slug,
                addedBy: userId
            }));

            // 🔹 Find existing brands (avoid duplicates)
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
            const brand = await models.brandModel.find({ isActive: true }).sort({ createdAt: -1 });

            return successResponse(res, "Brand list fetched", brand);
        } catch (error) {
            return errorResponse(res, "Server error", 500, error);
        }

    },
    deleteBrand: async (req, res) => {
        try {
            const { brandId } = req.params;

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
            const inventoryDocs = inventory.map((inv) => ({
                product: productId,
                sku: skuMap[inv.sku],
                warehouse: inv.warehouse,
                quantity: inv.quantity,
                costPrice: inv.costPrice,
                batchNumber: inv.batchNumber,
                expiryDate: inv.expiryDate,
                status: inv.quantity > 0 ? "active" : "out_of_stock",
            }));

            await models.inventoryModel.insertMany(inventoryDocs, { session });

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
    getProducts: async (req, res) => {
        try {
            const products = await models.productModel.aggregate([
                {
                    $lookup: {
                        from: "brands",
                        localField: "brand",
                        foreignField: "_id",
                        as: "brand"
                    }
                },
                { $unwind: { path: "$brand", preserveNullAndEmptyArrays: true } },

                {
                    $lookup: {
                        from: "categories",
                        localField: "category",
                        foreignField: "_id",
                        as: "category"
                    }
                },
                { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },

                {
                    $lookup: {
                        from: "subcategories",
                        localField: "category._id",
                        foreignField: "categoryId",
                        as: "subCategory"
                    }
                },
                { $unwind: { path: "$subCategory", preserveNullAndEmptyArrays: true } },

                {
                    $lookup: {
                        from: "skus",
                        localField: "_id",
                        foreignField: "product",
                        as: "skus"
                    }
                },

                {
                    $project: {
                        name: 1,
                        slug: 1,
                        images: 1,
                        isActive: 1,
                        createdAt: 1,

                        brand: {
                            _id: 1,
                            name: 1
                        },

                        category: {
                            _id: 1,
                            name: 1
                        },

                        subCategory: {
                            _id: 1,
                            name: 1
                        },

                        skus: {
                            _id: 1,
                            sku: 1,
                            mrp: 1,
                            sellingPrice: 1,
                            isActive: 1
                        },


                        totalStock: 1
                    }
                },

                { $sort: { createdAt: -1 } }
            ]);

            return res.status(200).json({
                success: true,
                data: products
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch products",
                error: error.message
            });
        }
    }



}