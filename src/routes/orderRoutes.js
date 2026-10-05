const express = require("express");

const router = express.Router();

const {
    createOrder,
    getOrders,
    getOrderById,
    updateOrder,
    deleteOrder,
    updateOrderStatus,
    getAllOrders,
    getAdminOrderById
} = require("../controllers/orderController");

const authMiddleware = require("../middleware/authMiddleware");


// =====================================================
// CUSTOMER ROUTES
// =====================================================

// Create order from cart
router.post("/", authMiddleware, createOrder);

// Get logged-in customer's orders
router.get("/", authMiddleware, getOrders);


// =====================================================
// ADMIN ROUTES
// IMPORTANT: These must come BEFORE /:id
// =====================================================

// Get all customer orders for admin
router.get("/admin", authMiddleware, getAllOrders);

// Get one customer order for admin
router.get("/admin/:id", authMiddleware, getAdminOrderById);


// =====================================================
// CUSTOMER SINGLE ORDER ROUTES
// =====================================================

// Get single order of logged-in customer
router.get("/:id", authMiddleware, getOrderById);

// Update order
router.put("/:id", authMiddleware, updateOrder);

// Cancel order
router.delete("/:id", authMiddleware, deleteOrder);


// =====================================================
// ORDER STATUS
// =====================================================

router.patch("/:id/status", authMiddleware, updateOrderStatus);


module.exports = router;