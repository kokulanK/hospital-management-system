const VisitorPass = require('../models/VisitorPass');
const Settings = require('../models/Settings');
const Admission = require('../models/Admission');

exports.generatePass = async (req, res) => {
  try {
    const { visitorName, visitorPhone } = req.body;
    const patientId = req.user._id;

    // Check if patient is admitted
    const admission = await Admission.findOne({ patient: patientId, status: 'admitted' });
    if (!admission) {
      return res.status(400).json({ error: 'Patient is not currently admitted to a ward.' });
    }

    // Check how many active passes exist
    const passesCount = await VisitorPass.countDocuments({ patient: patientId, status: 'active' });
    if (passesCount >= 3) {
      return res.status(400).json({ error: 'Maximum of 3 visitors allowed per patient.' });
    }

    const pass = new VisitorPass({
      patient: patientId,
      visitorName,
      visitorPhone
    });
    await pass.save();

    res.status(201).json(pass);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPasses = async (req, res) => {
  try {
    const patientId = req.user._id;
    const passes = await VisitorPass.find({ patient: patientId, status: 'active' });
    res.json(passes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.scanPass = async (req, res) => {
  try {
    const { qrCodeId } = req.body;

    const pass = await VisitorPass.findOne({ qrCodeId, status: 'active' }).populate('patient');
    if (!pass) {
      return res.status(404).json({ success: false, message: 'Invalid or revoked QR code.' });
    }

    // Check admission status
    const admission = await Admission.findOne({ patient: pass.patient._id, status: 'admitted' });
    if (!admission) {
      return res.status(400).json({ success: false, message: 'Patient is no longer admitted.' });
    }

    // If visitor is currently INSIDE, they are checking out (leaving)
    if (pass.isInside) {
      pass.isInside = false;
      await pass.save();
      return res.json({ 
        success: true, 
        message: 'Gate Open - Goodbye!',
        visitorName: pass.visitorName,
        visitorPhone: pass.visitorPhone
      });
    }

    // If visitor is currently OUTSIDE, they are checking in (entering)
    // 1. Check visiting hours
    let settings = await Settings.findOne({ key: 'VISITING_HOURS' });
    if (!settings) {
      settings = { value: { start: '14:00', end: '16:00' } }; // fallback
    }

    const now = new Date();
    
    // Strictly extract the exact hour and minute in Sri Lanka time (Asia/Colombo)
    const slTimeStr = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Colombo',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false
    }).format(now); // returns format like "22:56"
    
    const timeParts = slTimeStr.split(':').map(Number);
    const currentH = timeParts[0] === 24 ? 0 : timeParts[0]; // Handle 24:00 as 00:00
    const currentM = timeParts[1];
    const currentMinutes = currentH * 60 + currentM;
    
    const normalizeTime = (t) => (t || '').replace('.', ':');
    
    let [startH, startM] = normalizeTime(settings.value.start).split(':').map(Number);
    let [endH, endM] = normalizeTime(settings.value.end).split(':').map(Number);
    
    // Fallback for missing minutes
    if (isNaN(startM)) startM = 0;
    if (isNaN(endM)) endM = 0;
    
    // Handle 24:00 correctly for the end boundary
    const startMinutes = startH * 60 + startM;
    const endMinutes = (endH === 24 ? 24 : endH) * 60 + endM;

    if (currentMinutes < startMinutes || currentMinutes > endMinutes) {
      return res.status(403).json({ 
        success: false, 
        message: `Access Denied. Visiting hours are between ${settings.value.start} and ${settings.value.end}.` 
      });
    }

    // 2. Enforce only 3 visitors currently inside for this patient
    const currentInsideCount = await VisitorPass.countDocuments({ 
      patient: pass.patient._id, 
      isInside: true, 
      status: 'active' 
    });

    if (currentInsideCount >= 3) {
      return res.status(400).json({ 
        success: false, 
        message: 'Access Denied. Maximum of 3 visitors allowed inside at the same time.' 
      });
    }

    // Check-in success
    pass.isInside = true;
    await pass.save();
    return res.json({ 
      success: true, 
      message: 'Gate Open - Welcome!',
      visitorName: pass.visitorName,
      visitorPhone: pass.visitorPhone
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
