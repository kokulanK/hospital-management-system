const mongoose = require('mongoose');

const supplyRequestSchema = new mongoose.Schema({
  staff: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  itemName: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  status: {
    type: String,
    enum: ['pending', 'approved', 'delivered'],
    default: 'pending'
  },
  notes: { type: String, default: '' },
  approvedAt: { type: Date },
  deliveredAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('SupplyRequest', supplyRequestSchema);" "const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createSupplyRequest,
  getMySupplyRequests,
  getAllSupplyRequests,
  updateSupplyRequestStatus
} = require('../controllers/supplyRequestController');

const router = express.Router();

// Routes for cleaning staff
router.post('/', protect, authorize('cleaningStaff'), createSupplyRequest);
router.get('/my', protect, authorize('cleaningStaff'), getMySupplyRequests);

// Routes for admin
router.get('/', protect, authorize('admin'), getAllSupplyRequests);
router.put('/:id', protect, authorize('admin'), updateSupplyRequestStatus);

module.exports = router;