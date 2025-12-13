// models/SettingsModel.js
const db = require("../config/database");

module.exports = {

    /* ============================================================
       GENERAL SETTINGS (user_settings)
    ============================================================ */

    getUserSettings: async (userId) => {
        const [rows] = await db.execute(
            `SELECT * FROM user_settings WHERE user_id = ? LIMIT 1`,
            [userId]
        );
        return rows[0] || null;
    },

    updateUserProfile: async (userId, fullName, email) => {
        await db.execute(
            `UPDATE users SET full_name = ?, email = ? WHERE user_id = ?`,
            [fullName, email, userId]
        );
        return true;
    },

    updateGeneralSettings: async (userId, fields) => {
        const allowed = ["theme", "language", "timezone"];
        const updates = [];
        const values = [];

        for (let key of allowed) {
            if (fields[key] !== undefined) {
                updates.push(`${key} = ?`);
                values.push(fields[key]);
            }
        }

        if (!updates.length) return false;

        values.push(userId);

        await db.execute(
            `UPDATE user_settings SET ${updates.join(", ")} WHERE user_id = ?`,
            values
        );

        return true;
    },

    updateNotifications: async (userId, fields) => {
        const allowed = ["email_notif", "sms_notif", "push_notif"];
        const updates = [];
        const values = [];

        for (let key of allowed) {
            if (fields[key] !== undefined) {
                updates.push(`${key} = ?`);
                values.push(fields[key] ? 1 : 0);
            }
        }

        if (!updates.length) return false;

        values.push(userId);

        await db.execute(
            `UPDATE user_settings SET ${updates.join(", ")} WHERE user_id = ?`,
            values
        );

        return true;
    },

    updatePassword: async (userId, newPasswordHash) => {
        await db.execute(
            `UPDATE users SET password_hash = ? WHERE user_id = ?`,
            [newPasswordHash, userId]
        );
        return true;
    },

    /* ============================================================
       BILLING — OPTIONAL
       (Nếu bạn có bảng billing thì thêm vào)
    ============================================================ */

    updateBilling: async (userId, cardNumber) => {
        await db.execute(
            `UPDATE users SET card_number = ? WHERE user_id = ?`,
            [cardNumber, userId]
        );
        return true;
    },

    /* ============================================================
       INTEGRATIONS (user_integrations)
    ============================================================ */

    getIntegrations: async (userId) => {
        const [rows] = await db.execute(
            `SELECT * FROM user_integrations WHERE user_id = ?`,
            [userId]
        );
        return rows;
    },

    updateIntegration: async (userId, platform, connected, accountEmail = null) => {
        const [exists] = await db.execute(
            `SELECT * FROM user_integrations WHERE user_id = ? AND provider = ?`,
            [userId, platform]
        );

        // Nếu chưa có → tạo mới
        if (!exists.length) {
            return await db.execute(
                `INSERT INTO user_integrations (user_id, provider, status, account_email)
                 VALUES (?, ?, ?, ?)`,
                [userId, platform, connected ? "connected" : "disconnected", accountEmail]
            );
        }

        // Nếu có → update
        return await db.execute(
            `UPDATE user_integrations 
             SET status = ?, account_email = ?
             WHERE user_id = ? AND provider = ?`,
            [
                connected ? "connected" : "disconnected",
                accountEmail,
                userId,
                platform
            ]
        );
    },

    /* ============================================================
       TEAM
    ============================================================ */

    getTeam: async (userId) => {
        // Lấy team mà user là owner
        const [team] = await db.execute(
            `SELECT * FROM teams WHERE owner_id = ? LIMIT 1`,
            [userId]
        );

        if (!team.length) return null;

        const teamId = team[0].team_id;

        // Lấy thành viên trong team
        const [members] = await db.execute(
            `SELECT tm.*, u.email, u.full_name
             FROM team_members tm
             JOIN users u ON u.user_id = tm.user_id
             WHERE tm.team_id = ?`,
            [teamId]
        );

        return {
            ...team[0],
            members
        };
    },

    inviteTeamMember: async (teamId, userId, role = "Viewer") => {
        await db.execute(
            `INSERT INTO team_members (team_id, user_id, role, status)
             VALUES (?, ?, ?, 'pending')`,
            [teamId, userId, role]
        );
        return true;
    },

    removeTeamMember: async (teamId, userId) => {
        await db.execute(
            `DELETE FROM team_members WHERE team_id = ? AND user_id = ?`,
            [teamId, userId]
        );
        return true;
    },

    /* ============================================================
       UTILS
    ============================================================ */

    getUserByEmail: async (email) => {
        const [rows] = await db.execute(
            `SELECT * FROM users WHERE email = ? LIMIT 1`,
            [email]
        );
        return rows[0] || null;
    },

    getTeamByOwner: async (ownerId) => {
        const [rows] = await db.execute(
            `SELECT * FROM teams WHERE owner_id = ? LIMIT 1`,
            [ownerId]
        );
        return rows[0] || null;
    }

};
