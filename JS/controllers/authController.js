const pool = require('../config/database');
const bcrypt = require('bcrypt');

// Hiển thị trang login
const getLoginPage = (req, res) => {
    return res.render('login.ejs');
};

// Hiển thị trang register
const getRegisterPage = (req, res) => {
    return res.render('register.ejs');
};

// Xử lý đăng ký
const handleRegister = async (req, res) => {
    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password) {
        return res.send('Missing input!');
    }

    const password_hash = await bcrypt.hash(password, 10);

    try {
        await pool.query(
            "INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)",
            [full_name, email, password_hash]
        );

        return res.redirect('/auth/login');
    } catch (err) {
        console.log(err);
        res.send("Email đã tồn tại!");
    }
};

// Xử lý đăng nhập
const handleLogin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.send("Missing input!");
    }

    try {
        const [rows] = await pool.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (rows.length === 0) {
            return res.send("Sai email hoặc mật khẩu!");
        }

        const user = rows[0];

        const checkPassword = await bcrypt.compare(password, user.password_hash);

        if (!checkPassword) {
            return res.send("Sai mật khẩu!");
        }

        // Lưu session
        req.session.user = user;

        return res.redirect('/');
    } catch (err) {
        console.log(err);
        return res.send("Lỗi server!");
    }
};

module.exports = {
    getLoginPage,
    getRegisterPage,
    handleRegister,
    handleLogin
};
