const LabRequest = require('../models/LabRequest');
const User = require('../models/User');

// @desc    Create a lab request (doctor only)
// @route   POST /api/lab-requests
// @access  Private (doctor)
const createLabRequest = async (req, res) => {
  try {
    const { patientId, testType, description } = req.body;
    const patient = await User.findOne({ _id: patientId, role: 'patient' });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const request = await LabRequest.create({
      doctor: req.user._id,
      patient: patientId,
      testType,
      description
    });

    res.status(201).json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all lab requests for logged-in doctor
// @route   GET /api/lab-requests/doctor
// @access  Private (doctor)
const getDoctorLabRequests = async (req, res) => {
  try {
    const requests = await LabRequest.find({ doctor: req.user._id })
      .populate('patient', 'name email')
      .populate('acceptedBy', 'name')
      .sort('-createdAt');

    console.log("Doctor lab requests:", requests); // ✅ Debug
    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all lab requests for logged-in lab technician (pending/accepted)
// @route   GET /api/lab-requests/lab
// @access  Private (labTechnician)
const getLabTechnicianRequests = async (req, res) => {
  try {
    const requests = await LabRequest.find({ status: { $in: ['pending', 'accepted'] } })
      .populate('doctor', 'name email')
      .populate('patient', 'name email')
      .populate('acceptedBy', 'name')
      .sort('-createdAt');

    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Accept a lab request (lab technician)
// @route   PUT /api/lab-requests/:id/accept
// @access  Private (labTechnician)
const acceptLabRequest = async (req, res) => {
  try {
    const request = await LabRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }

    request.status = 'accepted';
    request.acceptedBy = req.user._id;
    request.acceptedAt = new Date();
    await request.save();

    res.json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Complete a lab request (upload result to Cloudinary)
// @route   PUT /api/lab-requests/:id/complete
// @access  Private (labTechnician)
const completeLabRequest = async (req, res) => {
  try {
    const request = await LabRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'accepted') {
      return res.status(400).json({ message: 'Request must be accepted first' });
    }

    if (req.file) {
      request.resultFile = req.file.path;      // ✅ Direct Cloudinary URL
      request.publicId = req.file.filename;    // Optional

      console.log("Uploaded file URL:", req.file.path); // ✅ Debug
    }

    request.status = 'completed';
    request.resultText = req.body.resultText || request.resultText;
    request.completedAt = new Date();

    await request.save();

    console.log("Updated request:", request); // ✅ Debug

    res.json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get a single lab request (doctor or lab technician)
// @route   GET /api/lab-requests/:id
// @access  Private (doctor or labTechnician)
const getLabRequestById = async (req, res) => {
  try {
    const request = await LabRequest.findById(req.params.id)
      .populate('doctor', 'name email')
      .populate('patient', 'name email')
      .populate('acceptedBy', 'name');

    if (!request) return res.status(404).json({ message: 'Request not found' });

    // Check authorization
    if (
      request.doctor._id.toString() !== req.user._id.toString() &&
      (!request.acceptedBy || request.acceptedBy._id.toString() !== req.user._id.toString()) &&
      req.user.role !== 'labTechnician'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createLabRequest,
  getDoctorLabRequests,
  getLabTechnicianRequests,
  acceptLabRequest,
  completeLabRequest,
  getLabRequestById
};