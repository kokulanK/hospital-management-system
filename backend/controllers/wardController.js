const Ward = require('../models/Ward');
const Bed = require('../models/Bed');
const Settings = require('../models/Settings');

exports.createWard = async (req, res) => {
  try {
    const ward = new Ward(req.body);
    await ward.save();
    res.status(201).json(ward);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getWards = async (req, res) => {
  try {
    const wards = await Ward.find();
    res.json(wards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createBed = async (req, res) => {
  try {
    const bed = new Bed(req.body);
    await bed.save();
    res.status(201).json(bed);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getBeds = async (req, res) => {
  try {
    const beds = await Bed.find({ ward: req.params.wardId });
    res.json(beds);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ key: 'VISITING_HOURS' });
    if (!settings) {
      settings = new Settings({ key: 'VISITING_HOURS', value: { start: '14:00', end: '16:00' }});
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { start, end } = req.body;
    let settings = await Settings.findOne({ key: 'VISITING_HOURS' });
    if (settings) {
      settings.value = { start, end };
      await settings.save();
    } else {
      settings = new Settings({ key: 'VISITING_HOURS', value: { start, end } });
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
