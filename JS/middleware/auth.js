// middleware/auth.js
module.exports = (req, res, next) => {
    try {
        // ===== 1. Nếu Passport được cấu hình =====
        if (typeof req.isAuthenticated === "function" && req.isAuthenticated()) {
            req.user = req.user || null;
            return next();
        }

        // ===== 2. Kiểm tra session backend =====
        if (req.session && req.session.user) {
            req.user = req.session.user;
            return next();
        }

        // ===== 3. (Tùy chọn) Kiểm tra token API =====
        // Nếu sau này bạn bổ sung Bearer token, block dưới sẽ sẵn dùng:
        if (req.headers.authorization) {
            const token = req.headers.authorization.split(" ")[1];
            if (token) {
                // giữ placeholder, để backend có thể upgrade sau
                req.user = { tokenOnly: true };
                return next();
            }
        }

        // ===== 4. Nếu không xác thực =====
        return res.status(401).json({
            status: "error",
            message: "Authentication required"
        });

    } catch (err) {
        console.error("Auth middleware error:", err);
        return res.status(500).json({
            status: "error",
            message: "Auth middleware crashed"
        });
    }
};
