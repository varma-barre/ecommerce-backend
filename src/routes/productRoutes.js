const express = require("express");

const router = express.Router();

const {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
} = require("../controllers/productController");

const authMiddleware = require("../middleware/authMiddleware");


// CREATE
router.post("/", authMiddleware, createProduct);


// READ ALL
router.get("/", getProducts);


// READ ONE
router.get("/:id", getProductById);


// UPDATE
router.put("/:id", authMiddleware, updateProduct);


// DELETE
router.delete("/:id", authMiddleware, deleteProduct);


module.exports = router;