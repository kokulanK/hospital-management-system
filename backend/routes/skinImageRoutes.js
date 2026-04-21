const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createSupplyRequest,
  getMySupplyRequests,
  getAllSupplyRequests,
  updateSupplyRequestStatus,
  updateMySupplyRequest
} = require('../controllers/supplyRequestController');

const router = express.Router();

// Routes for cleaning staff
router.post('/', protect, authorize('cleaningStaff'), createSupplyRequest);
router.get('/my', protect, authorize('cleaningStaff'), getMySupplyRequests);
router.put('/:id', protect, authorize('cleaningStaff'), updateMySupplyRequest);   // Edit own pending request

// Routes for admin
router.get('/', protect, authorize('admin'), getAllSupplyRequests);
router.patch('/:id/status', protect, authorize('admin'), updateSupplyRequestStatus); // Update status only

module.exports = router;