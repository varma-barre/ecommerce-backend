const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// REGISTER
const register = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        if (!name || !email || !phone || !password) {
            return res.status(400).json({
                message: "Please provide name, email, phone and password"
            });
        }

        if (name.trim().length < 3) {
            return res.status(400).json({
                message: "Name must contain at least 3 characters"
            });
        }

        if (!/^[0-9]{10}$/.test(phone)) {
            return res.status(400).json({
                message: "Phone number must be 10 digits"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must contain at least 6 characters"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            $or: [{ email: normalizedEmail }, { phone }]
        });

        if (existingUser) {
            return res.status(409).json({
                message: existingUser.email === normalizedEmail
                    ? "Email is already registered"
                    : "Phone number is already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            phone,
            password: hashedPassword
        });

        return res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Registration error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                message: "Email or phone number is already registered"
            });
        }

        return res.status(500).json({
            message: "Server error during registration"
        });
    }
};

// LOGIN
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Please provide email and password"
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({
                message: "Authentication configuration error"
            });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d",
                jwtid: crypto.randomUUID()
            }
        );

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            message: "Server error during login"
        });
    }
};

// GET PROFILE
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select("name email phone role defaultAddress");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            message: "Profile retrieved successfully",
            user
        });
    } catch (error) {
        console.error("Get profile error:", error);

        return res.status(500).json({
            message: "Unable to retrieve profile"
        });
    }
};

// UPDATE NAME ONLY
const updateProfileName = async (req, res) => {
    try {
        const { name } = req.body;

        if (typeof name !== "string" || name.trim().length < 3) {
            return res.status(400).json({
                message: "Name must contain at least 3 characters"
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: { name: name.trim() } },
            { new: true, runValidators: true }
        ).select("name email phone role defaultAddress");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            message: "Name updated successfully",
            user
        });
    } catch (error) {
        console.error("Update name error:", error);

        return res.status(500).json({
            message: "Unable to update name"
        });
    }
};

// UPDATE DEFAULT ADDRESS ONLY
const updateDefaultAddress = async (req, res) => {
    try {
        const { address, city, state, pincode } = req.body;

        if (
            typeof address !== "string" ||
            address.trim().length < 5 ||
            typeof city !== "string" ||
            city.trim().length < 2 ||
            typeof state !== "string" ||
            state.trim().length < 2 ||
            typeof pincode !== "string" ||
            !/^[0-9]{6}$/.test(pincode.trim())
        ) {
            return res.status(400).json({
                message: "Please provide a complete and valid delivery address"
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                $set: {
                    defaultAddress: {
                        address: address.trim(),
                        city: city.trim(),
                        state: state.trim(),
                        pincode: pincode.trim()
                    }
                }
            },
            { new: true, runValidators: true }
        ).select("name email phone role defaultAddress");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            message: "Default address saved successfully",
            user
        });
    } catch (error) {
        console.error("Save address error:", error);

        return res.status(500).json({
            message: "Unable to save default address"
        });
    }
};

// OPTIONAL: UPDATE NAME, PHONE AND ADDRESS TOGETHER
const updateProfile = async (req, res) => {
    try {
        const { name, phone, defaultAddress } = req.body;

        if (typeof name !== "string" || name.trim().length < 3) {
            return res.status(400).json({
                message: "Name must contain at least 3 characters"
            });
        }

        if (typeof phone !== "string" || !/^[0-9]{10}$/.test(phone)) {
            return res.status(400).json({
                message: "Phone number must contain exactly 10 digits"
            });
        }

        if (
            !defaultAddress ||
            typeof defaultAddress !== "object" ||
            Array.isArray(defaultAddress)
        ) {
            return res.status(400).json({
                message: "Please provide a valid default address"
            });
        }

        const address = {
            address: String(defaultAddress.address || "").trim(),
            city: String(defaultAddress.city || "").trim(),
            state: String(defaultAddress.state || "").trim(),
            pincode: String(defaultAddress.pincode || "").trim()
        };

        if (
            address.address.length < 5 ||
            address.city.length < 2 ||
            address.state.length < 2 ||
            !/^[0-9]{6}$/.test(address.pincode)
        ) {
            return res.status(400).json({
                message: "Please provide a complete and valid delivery address"
            });
        }

        const existingPhone = await User.findOne({
            phone,
            _id: { $ne: req.user.id }
        });

        if (existingPhone) {
            return res.status(409).json({
                message: "This phone number is already registered"
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                $set: {
                    name: name.trim(),
                    phone,
                    defaultAddress: address
                }
            },
            { new: true, runValidators: true }
        ).select("name email phone role defaultAddress");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            message: "Profile updated successfully",
            user
        });
    } catch (error) {
        console.error("Update profile error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                message: "This phone number is already registered"
            });
        }

        return res.status(500).json({
            message: "Unable to update profile"
        });
    }
};

module.exports = {
    register,
    login,
    getProfile,
    updateProfile,
    updateProfileName,
    updateDefaultAddress
};