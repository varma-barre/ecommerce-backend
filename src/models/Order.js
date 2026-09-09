const mongoose = require("mongoose");

// Order Item Schema
const orderItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },

        quantity: {
            type: Number,
            required: true,
            min: 1
        },

        price: {
            type: Number,
            required: true,
            min: 1
        }
    },
    {
        _id: false
    }
);


// Order Schema
const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        items: {
            type: [orderItemSchema],
            required: true,
            validate: {
                validator: function (items) {
                    return items.length > 0;
                },
                message: "Order must contain at least one item"
            }
        },

        totalAmount: {
            type: Number,
            required: true,
            min: 1
        },

        shippingAddress: {
            type: String,
            required: [true, "Shipping address is required"],
            trim: true
        },

        paymentMethod: {
            type: String,
            required: [true, "Payment method is required"],
            enum: {
                values: ["COD", "UPI", "CARD"],
                message: "Payment method must be COD, UPI or CARD"
            }
        },

        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed"],
            default: "pending"
        },

        orderStatus: {
            type: String,
            enum: {
                values: [
                    "pending",
                    "confirmed",
                    "shipped",
                    "delivered",
                    "cancelled"
                ],
                message: "Invalid order status"
            },
            default: "pending"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Order", orderSchema);