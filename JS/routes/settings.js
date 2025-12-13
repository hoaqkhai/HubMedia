const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const {
    getSettings,
    updateGeneral,
    updateNotifications,
    updatePassword,
    getTeam,
    inviteTeamMember,
    removeTeamMember,
    getIntegrations,
    updateIntegration,
} = require("../controllers/settingsController");

// Require login for all routes
router.use(auth);

/* ======================================================
   GENERAL + FULL SETTINGS
====================================================== */
router.get("/", getSettings);                // GET /settings
router.put("/general", updateGeneral);       // PUT /settings/general

/* ======================================================
   NOTIFICATIONS
====================================================== */
router.put("/notifications", updateNotifications);   // PUT /settings/notifications

/* ======================================================
   SECURITY – PASSWORD
====================================================== */
router.put("/security/password", updatePassword);    // PUT /settings/security/password

/* ======================================================
   TEAM
====================================================== */
router.get("/team", getTeam);                        // GET /settings/team
router.post("/team/invite", inviteTeamMember);       // POST /settings/team/invite
router.delete("/team/:memberId", removeTeamMember);  // DELETE /settings/team/:memberId

/* ======================================================
   INTEGRATIONS
====================================================== */
router.get("/integrations", getIntegrations);            // GET /settings/integrations
router.put("/integrations/:provider", updateIntegration); // PUT /settings/integrations/google

module.exports = router;
