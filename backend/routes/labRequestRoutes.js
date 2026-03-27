// backend/routes/labRequestRoutes.js

const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const uploadLab = require('../middleware/labUploadMiddleware');
const {
  createLabRequest,
  getDoctorLabRequests,
  getLabTechnicianRequests,
  acceptLabRequest,
  completeLabRequest,
  getLabRequestById,
  updateLabRequest,
  deleteLabRequest
} = require('../controllers/labRequestController');

const router = express.Router();

// Doctor routes
router.post('/', protect, authorize('doctor'), createLabRequest);
router.get('/doctor', protect, authorize('doctor'), getDoctorLabRequests);

// Lab technician routes
router.get('/lab', protect, authorize('labTechnician'), getLabTechnicianRequests);
router.put('/:id/accept', protect, authorize('labTechnician'), acceptLabRequest);
router.put('/:id/complete', protect, authorize('labTechnician'), uploadLab.single('resultFile'), completeLabRequest);

// Shared (doctor or lab technician) – UPDATE and DELETE
// ✅ Added uploadLab.single('resultFile') to handle file updates
router.put('/:id', protect, authorize('doctor', 'labTechnician'), uploadLab.single('resultFile'), updateLabRequest);
router.delete('/:id', protect, authorize('doctor', 'labTechnician'), deleteLabRequest);

// Shared – get by ID
router.get('/:id', protect, authorize('doctor', 'labTechnician'), getLabRequestById);

module.exports = router;