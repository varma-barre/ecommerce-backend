const Category = require("../models/category");

// CREATE CATEGORY
const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        // Validate category name
        if (!name || name.trim() === "") {
            return res.status(400).json({
                message: "Category name is required"
            });
        }

        // Check duplicate category
        const existingCategory = await Category.findOne({
            name: name.trim()
        });

        if (existingCategory) {
            return res.status(400).json({
                message: "Category already exists"
            });
        }

        // Create category
        const category = await Category.create({
            name: name.trim(),
            description: description ? description.trim() : ""
        });

        return res.status(201).json({
            message: "Category created successfully",
            category
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// GET ALL CATEGORIES
const getCategories = async (req, res) => {
    try {
        const categories = await Category.find();

        return res.status(200).json({
            message: "Categories fetched successfully",
            categories
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// GET CATEGORY BY ID
const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        return res.status(200).json({
            message: "Category fetched successfully",
            category
        });

    } catch (error) {
        return res.status(400).json({
            message: "Invalid category ID"
        });
    }
};


// UPDATE CATEGORY
const updateCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        // Validate category name
        if (!name || name.trim() === "") {
            return res.status(400).json({
                message: "Category name is required"
            });
        }

        // Check duplicate category name
        const existingCategory = await Category.findOne({
            name: name.trim(),
            _id: { $ne: req.params.id }
        });

        if (existingCategory) {
            return res.status(400).json({
                message: "Category already exists"
            });
        }

        // Update category
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            {
                name: name.trim(),
                description: description ? description.trim() : ""
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!category) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        return res.status(200).json({
            message: "Category updated successfully",
            category
        });

    } catch (error) {
        return res.status(400).json({
            message: "Invalid category ID or category data",
            error: error.message
        });
    }
};


// DELETE CATEGORY
const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(
            req.params.id
        );

        if (!category) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        return res.status(200).json({
            message: "Category deleted successfully"
        });

    } catch (error) {
        return res.status(400).json({
            message: "Invalid category ID"
        });
    }
};


module.exports = {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
};