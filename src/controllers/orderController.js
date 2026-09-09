const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");


// =====================================================
// CREATE ORDER FROM CART
// =====================================================
const createOrder = async (req, res) => {
    try {
        const { shippingAddress, paymentMethod } = req.body;

        // Validate shipping address
        if (!shippingAddress || shippingAddress.trim() === "") {
            return res.status(400).json({
                message: "Shipping address is required"
            });
        }

        // Validate payment method
        if (!paymentMethod) {
            return res.status(400).json({
                message: "Payment method is required"
            });
        }

        // Find user's cart
        const cart = await Cart.findOne({
            user: req.user.id
        }).populate("items.product");

        // Check cart
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                message: "Cart is empty"
            });
        }

        let totalAmount = 0;
        const orderItems = [];

        // Check every cart item
        for (const item of cart.items) {
            const product = item.product;

            // Product no longer exists
            if (!product) {
                return res.status(404).json({
                    message: "One or more products in cart no longer exist"
                });
            }

            // Product inactive
            if (product.status !== "active") {
                return res.status(400).json({
                    message: `${product.name} is currently inactive`
                });
            }

            // Check stock
            if (product.stock < item.quantity) {
                return res.status(400).json({
                    message: `Insufficient stock for ${product.name}`
                });
            }

            // Calculate item total
            const itemTotal = product.price * item.quantity;

            totalAmount += itemTotal;

            // Store product, quantity and current price
            orderItems.push({
                product: product._id,
                quantity: item.quantity,
                price: product.price
            });
        }

        // Reduce product stock
        for (const item of cart.items) {
            const product = await Product.findById(item.product._id);

            product.stock -= item.quantity;

            await product.save();
        }

        // Create order
        const order = new Order({
            user: req.user.id,
            items: orderItems,
            totalAmount,
            shippingAddress,
            paymentMethod
        });

        await order.save();

        // Clear cart after successful order
        cart.items = [];

        await cart.save();

        // Populate order details
        await order.populate("items.product");

        res.status(201).json({
            message: "Order created successfully",
            order
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// =====================================================
// GET ALL ORDERS OF LOGGED-IN USER
// =====================================================
const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            user: req.user.id
        })
        .populate("items.product")
        .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Orders retrieved successfully",
            count: orders.length,
            orders
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// =====================================================
// GET SINGLE ORDER
// =====================================================
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ObjectId
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                message: "Invalid order ID"
            });
        }

        const order = await Order.findOne({
            _id: id,
            user: req.user.id
        }).populate("items.product");

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        res.status(200).json({
            message: "Order retrieved successfully",
            order
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// =====================================================
// UPDATE ORDER
// =====================================================
const updateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { shippingAddress, paymentMethod } = req.body;

        // Validate ObjectId
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                message: "Invalid order ID"
            });
        }

        const order = await Order.findOne({
            _id: id,
            user: req.user.id
        });

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        // Do not update cancelled or delivered orders
        if (
            order.orderStatus === "cancelled" ||
            order.orderStatus === "delivered"
        ) {
            return res.status(400).json({
                message: `Cannot update a ${order.orderStatus} order`
            });
        }

        if (shippingAddress !== undefined) {
            if (shippingAddress.trim() === "") {
                return res.status(400).json({
                    message: "Shipping address cannot be empty"
                });
            }

            order.shippingAddress = shippingAddress;
        }

        if (paymentMethod !== undefined) {
            if (!["COD", "UPI", "CARD"].includes(paymentMethod)) {
                return res.status(400).json({
                    message: "Payment method must be COD, UPI or CARD"
                });
            }

            order.paymentMethod = paymentMethod;
        }

        await order.save();

        res.status(200).json({
            message: "Order updated successfully",
            order
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// =====================================================
// DELETE / CANCEL ORDER
// =====================================================
const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ObjectId
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                message: "Invalid order ID"
            });
        }

        const order = await Order.findOne({
            _id: id,
            user: req.user.id
        });

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        // Only pending/confirmed orders can be cancelled
        if (
            order.orderStatus === "shipped" ||
            order.orderStatus === "delivered"
        ) {
            return res.status(400).json({
                message: `Cannot cancel a ${order.orderStatus} order`
            });
        }

        // Restore stock
        for (const item of order.items) {
            const product = await Product.findById(item.product);

            if (product) {
                product.stock += item.quantity;
                await product.save();
            }
        }

        // Mark as cancelled
        order.orderStatus = "cancelled";

        await order.save();

        res.status(200).json({
            message: "Order cancelled successfully",
            order
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// =====================================================
// UPDATE ORDER STATUS
// =====================================================
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { orderStatus } = req.body;

        // Validate ObjectId
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                message: "Invalid order ID"
            });
        }

        // Validate status
        const validStatuses = [
            "pending",
            "confirmed",
            "shipped",
            "delivered",
            "cancelled"
        ];

        if (!orderStatus) {
            return res.status(400).json({
                message: "Order status is required"
            });
        }

        if (!validStatuses.includes(orderStatus)) {
            return res.status(400).json({
                message:
                    "Order status must be pending, confirmed, shipped, delivered or cancelled"
            });
        }

        const order = await Order.findOne({
            _id: id,
            user: req.user.id
        });

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        // Delivered orders cannot be changed
        if (order.orderStatus === "delivered") {
            return res.status(400).json({
                message: "Delivered order status cannot be changed"
            });
        }

        // Cancelled orders cannot be changed
        if (order.orderStatus === "cancelled") {
            return res.status(400).json({
                message: "Cancelled order status cannot be changed"
            });
        }

        // If cancelling, restore stock
        if (
            orderStatus === "cancelled" &&
            order.orderStatus !== "cancelled"
        ) {
            for (const item of order.items) {
                const product = await Product.findById(item.product);

                if (product) {
                    product.stock += item.quantity;
                    await product.save();
                }
            }
        }

        order.orderStatus = orderStatus;

        await order.save();

        res.status(200).json({
            message: "Order status updated successfully",
            order
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


module.exports = {
    createOrder,
    getOrders,
    getOrderById,
    updateOrder,
    deleteOrder,
    updateOrderStatus
};