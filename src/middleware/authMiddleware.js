const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    try {
        // 1. Check JWT secret configuration
        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is missing from environment variables");

            return res.status(500).json({
                message: "Authentication configuration error"
            });
        }

        // 2. Read Authorization header
        const authHeader = req.headers.authorization;

        if (
            !authHeader ||
            !authHeader.startsWith("Bearer ")
        ) {
            return res.status(401).json({
                message: "Access denied. No valid token provided."
            });
        }

        // 3. Extract token
        const token = authHeader.slice(7).trim();

        if (!token) {
            return res.status(401).json({
                message: "Access denied. Token is empty."
            });
        }

        // 4. Verify JWT
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // 5. Validate decoded user ID
        if (
            !decoded ||
            typeof decoded.id !== "string" ||
            !decoded.id.trim()
        ) {
            return res.status(401).json({
                message: "Invalid authentication token."
            });
        }

        // 6. Attach authenticated user to request
        req.user = {
            id: decoded.id,
            role: decoded.role
        };

        // 7. Continue to controller
        return next();

    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                message: "Session expired. Please log in again."
            });
        }

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                message: "Invalid authentication token."
            });
        }

        console.error("Authentication middleware error:", error);

        return res.status(500).json({
            message: "Authentication failed due to a server error."
        });
    }
};

module.exports = authMiddleware;