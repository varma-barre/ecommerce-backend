const express = require("express");

const router = express.Router();

const {
    createOrder,
    getOrders,
    getOrderById,
    updateOrder,
    deleteOrder,
    updateOrderStatus
} = require("../controllers/orderController");

const authMiddleware = require("../middleware/authMiddleware");


// Create order from cart
router.post("/", authMiddleware, createOrder);

// Get all orders
router.get("/", authMiddleware, getOrders);

// Get single order
router.get("/:id", authMiddleware, getOrderById);

// Update order
router.put("/:id", authMiddleware, updateOrder);

// Cancel order
router.delete("/:id", authMiddleware, deleteOrder);

// Update order status
router.patch("/:id/status", authMiddleware, updateOrderStatus);


module.exports = router;