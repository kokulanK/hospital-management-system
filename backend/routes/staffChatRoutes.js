const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const { getChatHistory, saveMessage, deleteChat } = require('../controllers/staffChatController');

const router = express.Router();

// Allow lab technicians and cleaning staff
router.use(protect, authorize('labTechnician', 'cleaningStaff'));

router.get('/', getChatHistory);
router.post('/', saveMessage);
router.delete('/', deleteChat);

module.exports = router;
