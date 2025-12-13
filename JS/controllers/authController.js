// controllers/authController.js
const AuthModel = require("../models/AuthModel");
const UserModel = require("../models/UserModel");

module.exports = {

    getLoginPage: (req, res) => {
        if (req.session.user) return res.redirect('/');
        res.render('auth/login.ejs');
    },

    postLogin: async (req, res) => {
        const { email, password } = req.body; // email hoặc username từ frontend

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Vui lòng điền đầy đủ thông tin" });
        }

        try {
            const result = await AuthModel.login(email, password);

            if (!result.success) {
                return res.status(400).json(result);
            }

            // Lưu session
            req.session.user = result.user;

            return res.json({
                success: true,
                message: "Đăng nhập thành công",
                user: req.session.user
            });

        } catch (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: "Server error" });
        }
    },

    postRegister: async (req, res) => {
        const { full_name, email, username, password } = req.body;

        if (!full_name || !email || !username || !password) {
            return res.status(400).json({ success: false, message: "Thiếu dữ liệu" });
        }

        try {
            const result = await AuthModel.register({
                full_name,
                email,
                username,
                password
            });

            if (!result.success) {
                return res.status(400).json(result);
            }

            return res.status(201).json({ 
                success: true, 
                message: "Đăng ký thành công" 
            });

        } catch (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: "Server error" });
        }
    },

    logout: (req, res) => {
        req.session.destroy(() => {
            res.clearCookie("session_cookie");
            res.json({ success: true, message: "Đã đăng xuất" });
        });
    },

    me: (req, res) => {
        if (!req.session.user) {
            return res.status(401).json({ success: false, message: "Chưa đăng nhập" });
        }
        res.json({ success: true, user: req.session.user });
    }
};
