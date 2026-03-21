const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const uploadLab = require('../middleware/labUploadMiddleware'); // new middleware
const {
  createLabRequest,
  getDoctorLabRequests,
  getLabTechnicianRequests,
  acceptLabRequest,
  completeLabRequest,
  getLabRequestById
} = require('../controllers/labRequestController');

const router = express.Router();

// Doctor routes
router.post('/', protect, authorize('doctor'), createLabRequest);
router.get('/doctor', protect, authorize('doctor'), getDoctorLabRequests);

// Lab technician routes
router.get('/lab', protect, authorize('labTechnician'), getLabTechnicianRequests);
router.put('/:id/accept', protect, authorize('labTechnician'), acceptLabRequest);
router.put('/:id/complete', protect, authorize('labTechnician'), uploadLab.single('resultFile'), completeLabRequest);

// Shared (doctor or lab technician)
router.get('/:id', protect, authorize('doctor', 'labTechnician'), getLabRequestById);

module.exports = router;