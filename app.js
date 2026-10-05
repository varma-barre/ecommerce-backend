const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const productRoutes = require("./src/routes/productRoutes");
const categoryRoutes = require("./src/routes/categoryRoutes");
const cartRoutes = require("./src/routes/cartRoutes");
const orderRoutes = require("./src/routes/orderRoutes");
const mutualFundRoutes = require("./src/routes/mutualFundRoutes");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect MongoDB
connectDB();

// Test route
app.get("/", (req, res) => {
    res.json({
        message: "E-commerce backend is running"
    });
});

// Authentication routes
app.use("/api/auth", authRoutes);

//user routes
app.use("/api/user", userRoutes);

//product routes
app.use("/api/products", productRoutes);

//category routes
app.use("/api/categories", categoryRoutes);

//cart routes
app.use("/api/cart",cartRoutes);

//order routes
app.use("/api/orders",orderRoutes);

//mutualfund routes
app.use("/api/mutual-funds", mutualFundRoutes);

//images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});