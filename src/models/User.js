const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
    {
        address: {
            type: String,
            default: "",
            trim: true
        },
        city: {
            type: String,
            default: "",
            trim: true
        },
        state: {
            type: String,
            default: "",
            trim: true
        },
        pincode: {
            type: String,
            default: "",
            trim: true
        }
    },
    { _id: false }
);

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },

        phone: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        password: {
            type: String,
            required: true,
            minlength: 6
        },

        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user"
        },

        defaultAddress: {
            type: addressSchema,
            default: () => ({})
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);