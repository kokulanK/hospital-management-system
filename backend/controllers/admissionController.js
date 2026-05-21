const Admission = require('../models/Admission');
const Bed = require('../models/Bed');

exports.recommendAdmission = async (req, res) => {
  try {
    const { patientId } = req.body;
    
    // Check if there is already an active admission
    const existing = await Admission.findOne({ 
      patient: patientId, 
      status: { $in: ['pending_allocation', 'admitted'] } 
    });
    if (existing) {
      return res.status(400).json({ error: 'Patient already has an active admission.' });
    }

    const admission = new Admission({
      patient: patientId,
      doctor: req.user._id,
      status: 'pending_allocation'
    });
    await admission.save();
    res.status(201).json(admission);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getPendingAdmissions = async (req, res) => {
  try {
    const admissions = await Admission.find({ status: 'pending_allocation' })
      .populate('patient', 'name email')
      .populate('doctor', 'name');
    res.json(admissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.allocateBed = async (req, res) => {
  try {
    const { wardId, bedId } = req.body;
    const admission = await Admission.findById(req.params.id);
    if (!admission) return res.status(404).json({ error: 'Admission not found' });

    admission.ward = wardId;
    admission.bed = bedId;
    admission.status = 'admitted';
    admission.admissionDate = new Date();
    await admission.save();

    await Bed.findByIdAndUpdate(bedId, { isOccupied: true });

    res.json(admission);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getPatientAdmission = async (req, res) => {
  try {
    const admission = await Admission.findOne({ patient: req.params.patientId, status: 'admitted' })
      .populate('doctor', 'name')
      .populate('ward', 'name')
      .populate('bed', 'bedNumber');
    res.json(admission || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
