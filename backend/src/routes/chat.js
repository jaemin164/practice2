const express = require('express');
const { getOrCreateRoom, getMyRooms, getMessages } = require('../controllers/chatController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/rooms', authenticate, getOrCreateRoom);
router.get('/rooms', authenticate, getMyRooms);
router.get('/rooms/:roomId/messages', authenticate, getMessages);

module.exports = router;
