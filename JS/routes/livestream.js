const express = require('express');
const router = express.Router();

const streamsCtrl = require('../controllers/streamsController');
const chatCtrl = require('../controllers/chatController');
const modCtrl = require('../controllers/moderationController');
const viewersCtrl = require('../controllers/viewersController');

// Streams
router.post('/start', streamsCtrl.startStream);
router.post('/end', streamsCtrl.endStream); // <-- FIXED

// Chat
router.post('/chat/send', chatCtrl.sendMessage);
router.get('/chat/simulate', chatCtrl.simulateChat);

// Moderation
router.post('/moderation/add', modCtrl.add);
router.get('/moderation', modCtrl.list);
router.post('/moderation/approve/:id', modCtrl.approve);
router.post('/moderation/reject/:id', modCtrl.reject);

// Viewers
router.get('/viewers', viewersCtrl.getCount);

module.exports = router;
