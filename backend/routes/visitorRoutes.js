const express = require('express');
const router = express.Router();
const visitorController = require('../controllers/visitorController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Patient generates and views passes
router.post('/generate', protect, authorize('patient'), visitorController.generatePass);
router.get('/', protect, authorize('patient'), visitorController.getPasses);

// Hardware scans pass (public or uses a specific API key depending on setup, but let's leave it public/unprotected for Arduino easily accessing it)
router.post('/scan', visitorController.scanPass);

module.exports = router;
