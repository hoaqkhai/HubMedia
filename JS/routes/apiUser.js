const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const ApiUserController = require("../controllers/apiUserController");

// Require login for all routes
router.use(auth);

// ---------------------
// PROFILE (General)
// ---------------------
router.put("/update", ApiUserController.updateProfile);

// ---------------------
// BILLING
// ---------------------
router.put("/billing", ApiUserController.updateBilling);

// ---------------------
// NOTIFICATIONS
// ---------------------
router.put("/notifications", ApiUserController.updateNotifications);

// ---------------------
// SECURITY – PASSWORD
// ---------------------
router.put("/password", ApiUserController.updatePassword);

// ---------------------
// INTEGRATIONS
// ---------------------
router.post("/integrations/:platform", ApiUserController.updateIntegration);

// ---------------------
// TEAM
// ---------------------
router.post("/team/invite", ApiUserController.inviteTeamMember);
router.delete("/team/remove", ApiUserController.removeTeamMember);

module.exports = router;
