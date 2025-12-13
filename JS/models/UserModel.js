// models/UserModel.js
const db = require("../config/database");
const bcrypt = require("bcrypt");

const UserModel = {

    // Lấy user theo email hoặc username (phục vụ login)
    findByEmailOrUsername: async (identifier) => {
        const [rows] = await db.execute(
            "SELECT * FROM users WHERE email = ? OR username = ? LIMIT 1",
            [identifier, identifier]
        );
        return rows[0] || null;
    },

    // Lấy user theo email
    findByEmail: async (email) => {
        const [rows] = await db.execute(
            "SELECT * FROM users WHERE email = ? LIMIT 1",
            [email]
        );
        return rows[0] || null;
    },

    // Lấy user theo username
    findByUsername: async (username) => {
        const [rows] = await db.execute(
            "SELECT * FROM users WHERE username = ? LIMIT 1",
            [username]
        );
        return rows[0] || null;
    },

    // Lấy user theo ID (cho passport deserializer)
    findById: async (id) => {
        const [rows] = await db.execute(
            "SELECT * FROM users WHERE user_id = ? LIMIT 1",
            [id]
        );
        return rows[0] || null;
    },

    // Tạo user mới
    createUser: async ({ full_name, email, username, password, provider = "none" }) => {
        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.execute(
            `INSERT INTO users (full_name, email, username, password, social_provider) 
             VALUES (?, ?, ?, ?, ?)`,
            [full_name, email, username, hashedPassword, provider]
        );

        return result.insertId;
    },

    // Tạo user khi login bằng OAuth
    createOAuthUser: async ({ full_name, email, login_type }) => {
        const [result] = await db.execute(
            `
            INSERT INTO users (full_name, email, login_type)
            VALUES (?, ?, ?)
            `,
            [full_name, email, login_type]
        );

        return result.insertId;
    }
};

module.exports = UserModel;
