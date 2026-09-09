const express = require("express");

const router = express.Router();

const {
    addToCart,
    getCart,
    updateCart,
    removeFromCart,
    clearCart
} = require("../controllers/cartController");

const authMiddleware = require("../middleware/authMiddleware");

// Add product
router.post("/add", authMiddleware, addToCart);

// View cart
router.get("/", authMiddleware, getCart);

// Update quantity
router.put("/update/:productId", authMiddleware, updateCart);

// Remove product
router.delete("/remove/:productId", authMiddleware, removeFromCart);

// Clear cart
router.delete("/clear", authMiddleware, clearCart);

module.exports = router;