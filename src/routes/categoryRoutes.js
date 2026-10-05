const express = require("express");

const router = express.Router();

const {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
} = require("../controllers/categoryController");

const authMiddleware = require("../middleware/authMiddleware");


// Create Category
router.post("/", authMiddleware, createCategory);

// Get All Categories
router.get("/", getCategories);

// Get Category By ID
router.get("/:id", getCategoryById);

// Update Category
router.put("/:id", authMiddleware, updateCategory);

// Delete Category
router.delete("/:id", authMiddleware, deleteCategory);


module.exports = router;