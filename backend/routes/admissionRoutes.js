const express = require('express');
const router = express.Router();
const admissionController = require('../controllers/admissionController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Doctor recommends admission
router.post('/recommend', protect, authorize('doctor'), admissionController.recommendAdmission);

// Receptionist views pending and allocates
router.get('/pending', protect, authorize('receptionist', 'admin'), admissionController.getPendingAdmissions);
router.put('/:id/allocate', protect, authorize('receptionist', 'admin'), admissionController.allocateBed);

// Patient fetches their admission
router.get('/patient/:patientId', protect, authorize('patient', 'receptionist', 'doctor', 'admin'), admissionController.getPatientAdmission);

module.exports = router;
