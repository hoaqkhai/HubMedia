const bcrypt = require("bcrypt");
const SettingsModel = require("../models/SettingsModel");

module.exports = {
    /* ===========================
       PROFILE UPDATE
    ============================ */
    updateProfile: async (req, res) => {
        try {
            const userId = req.session.user.user_id;
            const { full_name, email } = req.body;

            await SettingsModel.updateUserSettings(userId, { full_name, email });

            res.json({ success: true, message: "Profile updated" });
        } catch (err) {
            console.error("updateProfile ERROR:", err);
            res.status(500).json({ success: false, error: err.message });
        }
    },

    /* ===========================
       BILLING
    ============================ */
    updateBilling: async (req, res) => {
        try {
            const userId = req.session.user.user_id;
            const { card_number } = req.body;

            await SettingsModel.updateBilling(userId, { card_number });

            res.json({ success: true, message: "Billing updated" });
        } catch (err) {
            console.error("updateBilling ERROR:", err);
            res.status(500).json({ success: false, error: err.message });
        }
    },

    /* ===========================
       NOTIFICATIONS
    ============================ */
    updateNotifications: async (req, res) => {
        try {
            const userId = req.session.user.user_id;
            const { notify_email, notify_sms } = req.body;

            await SettingsModel.updateNotifications(userId, {
                email_notif: notify_email,
                sms_notif: notify_sms,
            });

            res.json({ success: true, message: "Notifications updated" });
        } catch (err) {
            console.error("updateNotifications ERROR:", err);
            res.status(500).json({ success: false, error: err.message });
        }
    },

    /* ===========================
       PASSWORD
    ============================ */
    updatePassword: async (req, res) => {
        try {
            const userId = req.session.user.user_id;
            const { current_password, new_password } = req.body;

            const current = await SettingsModel.getUserPassword(userId);

            if (!current)
                return res.status(400).json({ success: false, error: "User not found" });

            const match = await bcrypt.compare(current_password, current.password);
            if (!match)
                return res.status(400).json({ success: false, error: "Incorrect password" });

            const hashed = await bcrypt.hash(new_password, 10);

            await SettingsModel.updatePassword(userId, hashed);

            res.json({ success: true, message: "Password updated" });

        } catch (err) {
            console.error("updatePassword ERROR:", err);
            res.status(500).json({ success: false, error: err.message });
        }
    },

    /* ===========================
       INTEGRATIONS
    ============================ */
    updateIntegration: async (req, res) => {
        try {
            const userId = req.session.user.user_id;
            const provider = req.params.platform.toLowerCase();
            const { connected, account_email } = req.body;

            if (connected === false) {
                await SettingsModel.disconnectIntegration(userId, provider);
                return res.json({ success: true, message: `${provider} disconnected` });
            }

            await SettingsModel.connectIntegration(userId, provider, {
                account_email
            });

            res.json({ success: true, message: `${provider} connected` });
        } catch (err) {
            console.error("updateIntegration ERROR:", err);
            res.status(500).json({ success: false, error: err.message });
        }
    },

    /* ===========================
       TEAM
    ============================ */
    inviteTeamMember: async (req, res) => {
        try {
            const userId = req.session.user.user_id;
            const { email } = req.body;

            await SettingsModel.inviteTeamMemberByEmail(userId, email);

            res.json({ success: true, message: "Invitation sent" });
        } catch (err) {
            console.error("inviteTeamMember ERROR:", err);
            res.status(500).json({ success: false, error: err.message });
        }
    },

    removeTeamMember: async (req, res) => {
        try {
            const userId = req.session.user.user_id;
            const { email } = req.body;

            await SettingsModel.removeTeamMemberByEmail(userId, email);

            res.json({ success: true, message: "User removed" });
        } catch (err) {
            console.error("removeTeamMember ERROR:", err);
            res.status(500).json({ success: false, error: err.message });
        }
    }
};
