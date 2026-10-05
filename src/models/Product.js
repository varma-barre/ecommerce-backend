const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Product name is required"],
            trim: true
        },

        description: {
            type: String,
            required: [true, "Product description is required"],
            trim: true
        },

        price: {
            type: Number,
            required: [true, "Product price is required"],
            min: [1, "Price cannot be zero and negative"]
        },

        category: {
            type: String,
            required: [true, "Product category is required"],
            trim: true
        },

        stock: {
            type: Number,
            required: [true, "Product stock is required"],
            min: [0, "Stock cannot be negative"]
        },
         status: {
            type: String,
            enum: {
                values: ["active", "inactive"],
                message: "Status must be active or inactive"
            },
            default: "active"
        },
        image: {
        type: String,
        default: ""
}

    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Product", productSchema);