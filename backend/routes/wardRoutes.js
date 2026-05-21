const express = require('express');
const router = express.Router();
const wardController = require('../controllers/wardController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Receptionist, Admin manage wards/beds
router.post('/wards', protect, authorize('receptionist', 'admin'), wardController.createWard);
router.get('/wards', protect, wardController.getWards);

router.post('/beds', protect, authorize('receptionist', 'admin'), wardController.createBed);
router.get('/beds/:wardId', protect, wardController.getBeds);

// Visiting hours settings
router.get('/settings/visiting-hours', protect, wardController.getSettings);
router.put('/settings/visiting-hours', protect, authorize('receptionist', 'admin'), wardController.updateSettings);

module.exports = router;
