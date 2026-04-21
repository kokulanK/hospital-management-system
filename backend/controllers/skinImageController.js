const SupplyRequest = require('../models/SupplyRequest');

// @desc    Create a supply request (cleaning staff only)
// @route   POST /api/supply-requests
// @access  Private (cleaningStaff)
const createSupplyRequest = async (req, res) => {
  try {
    const { itemName, quantity, notes } = req.body;
    if (!itemName || !quantity) {
      return res.status(400).json({ message: 'Item name and quantity are required' });
    }
    const request = await SupplyRequest.create({
      staff: req.user._id,
      itemName,
      quantity,
      notes: notes || ''
    });
    res.status(201).json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all requests for logged-in staff
// @route   GET /api/supply-requests/my
// @access  Private (cleaningStaff)
const getMySupplyRequests = async (req, res) => {
  try {
    const requests = await SupplyRequest.find({ staff: req.user._id })
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all supply requests (admin only)
// @route   GET /api/supply-requests
// @access  Private (admin)
const getAllSupplyRequests = async (req, res) => {
  try {
    const requests = await SupplyRequest.find({})
      .populate('staff', 'name email')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update request status (admin only)
// @route   PUT /api/supply-requests/:id
// @access  Private (admin)
const updateSupplyRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'delivered'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const request = await SupplyRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.status = status;
    if (status === 'approved') request.approvedAt = new Date();
    if (status === 'delivered') request.deliveredAt = new Date();

    await request.save();
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createSupplyRequest,
  getMySupplyRequests,
  getAllSupplyRequests,
  updateSupplyRequestStatus
};