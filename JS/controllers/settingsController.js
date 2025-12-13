const bcrypt = require("bcrypt");
const SettingsModel = require("../models/SettingsModel");

/* ======================================================
   GET ALL SETTINGS OF USER (General + Notifications + Security + Integrations + Teams)
   GET /settings
====================================================== */
exports.getSettings = async (req, res) => {
    try {
        const userId = req.session.user.user_id;

        const settings = await SettingsModel.getUserSettings(userId);
        const integrations = await SettingsModel.getUserIntegrations(userId);
        const teams = await SettingsModel.getUserTeams(userId);

        res.json({
            success: true,
            data: {
                settings,
                integrations,
                teams,
            }
        });

    } catch (err) {
        console.error("getSettings ERROR:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};


/* ======================================================
   UPDATE GENERAL SETTINGS
   PUT /settings/general
====================================================== */
exports.updateGeneral = async (req, res) => {
    try {
        const userId = req.session.user.user_id;
        const payload = req.body; // theme, language, timezone

        await SettingsModel.updateUserSettings(userId, payload);

        res.json({ success: true, message: "General settings updated" });
    } catch (err) {
        console.error("updateGeneral ERROR:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};


/* ======================================================
   UPDATE NOTIFICATIONS
   PUT /settings/notifications
====================================================== */
exports.updateNotifications = async (req, res) => {
    try {
        const userId = req.session.user.user_id;
        const { email_notif, sms_notif, push_notif } = req.body;

        await SettingsModel.updateNotifications(userId, {
            email_notif,
            sms_notif,
            push_notif,
        });

        res.json({ success: true, message: "Notification settings updated" });
    } catch (err) {
        console.error("updateNotifications ERROR:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};


/* ======================================================
   SECURITY – UPDATE PASSWORD
   PUT /settings/security/password
====================================================== */
exports.updatePassword = async (req, res) => {
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
};


/* ======================================================
   INTEGRATIONS
====================================================== */

// GET /settings/integrations
exports.getIntegrations = async (req, res) => {
    try {
        const userId = req.session.user.user_id;
        const integrations = await SettingsModel.getUserIntegrations(userId);

        res.json({ success: true, integrations });

    } catch (err) {
        console.error("getIntegrations ERROR:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};


// PUT /settings/integrations/:provider
exports.updateIntegration = async (req, res) => {
    try {
        const userId = req.session.user.user_id;
        const provider = req.params.provider;
        const { connected, account_email, access_token, refresh_token } = req.body;

        if (connected === false) {
            await SettingsModel.disconnectIntegration(userId, provider);
            return res.json({ success: true, message: "Integration disconnected" });
        }

        await SettingsModel.connectIntegration(userId, provider, {
            account_email,
            access_token,
            refresh_token,
        });

        res.json({ success: true, message: "Integration connected" });

    } catch (err) {
        console.error("updateIntegration ERROR:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};


/* ======================================================
   TEAM MANAGEMENT
====================================================== */

// GET /settings/team
exports.getTeam = async (req, res) => {
    try {
        const userId = req.session.user.user_id;

        const teams = await SettingsModel.getUserTeams(userId);

        res.json({ success: true, teams });

    } catch (err) {
        console.error("getTeam ERROR:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};


// POST /settings/team/invite
exports.inviteTeamMember = async (req, res) => {
    try {
        const { team_id, user_id, role } = req.body;

        await SettingsModel.inviteTeamMember(team_id, user_id, role);

        res.json({ success: true, message: "Invitation sent" });

    } catch (err) {
        console.error("inviteTeamMember ERROR:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};


// DELETE /settings/team/:memberId
exports.removeTeamMember = async (req, res) => {
    try {
        const memberId = req.params.memberId;

        await SettingsModel.updateTeamMemberStatus(memberId, "removed");

        res.json({ success: true, message: "Member removed" });

    } catch (err) {
        console.error("removeTeamMember ERROR:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};
