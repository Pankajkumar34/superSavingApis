
const { errorResponse, successResponse, failedErrorResponse } = require('../../../helpers/response.helper');
const models = require('../../../models/index');
module.exports = {
    addBrand: async (req, res) => {
        try {
            const { name, logo, description, country, seo, createdBy } = req.body;
            const slug = name.trim().toLowerCase().replace(/\s+/g, '-');

            const existingBrand = await models.brandModel.findOne({ name: name.trim() });
            if (existingBrand) {
                return failedErrorResponse(res, "Brand already exists", 400);
            }
            const newBrand = new models.brandModel({ name: name.trim(), slug, logo, description, country, seo, createdBy });
            await newBrand.save();
            return successResponse(res, "Brand added successfully", newBrand);
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
            const { name, brandId, type, image } = req.body;
            const slug = name.trim().toLowerCase().replace(/\s+/g, '-');
            const existingCategory = await models.categoryModel.findOne({
                name: name.trim()
            });

            if (existingCategory) {
                return failedErrorResponse(res, "Category already exists", 400);
            }

            const category = new models.categoryModel({
                name: name.trim(),
                slug,
                brandId,
                type,
                image,
            });

            await category.save();

            return successResponse(res, "Category added successfully", category);
        } catch (error) {
            return errorResponse(res, "Server error", 500, error);
        }
    },
    getCategories: async (req, res) => {
        try {
            const categories = await models.categoryModel
                .find({ isActive: true })
                .populate("brand", "name slug")
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
            const { name, categoryId, brandId, image } = req.body;
            const slug = name.trim().toLowerCase().replace(/\s+/g, '-');
            const existingSubCategory = await models.subcategoryModel.findOne({
                name: name.trim(),
                categoryId: categoryId
            });

            if (existingSubCategory) {
                return failedErrorResponse(res, "Subcategory already exists", 400);
            }

            const subCategory = new models.subcategoryModel({
                name: name.trim(),
                slug,
                categoryId: categoryId,
                brandId: brandId,
                image,
            });

            await subCategory.save();

            return successResponse(
                res,
                "Subcategory added successfully",
                subCategory
            );
        } catch (error) {
            return errorResponse(res, "Server error", 500, error);
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
    }




}