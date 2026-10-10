const express = require("express");
const router = express.Router();

const {
    register,
    login,
    getProfile,
    updateProfile,
    updateProfileName,
    updateDefaultAddress
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected profile routes
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);

// Save name separately
router.put("/profile/name", authMiddleware, updateProfileName);

// Save default address separately
router.put("/profile/address", authMiddleware, updateDefaultAddress);

module.exports = router;