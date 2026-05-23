const mongoose = require('mongoose');
const crypto = require('crypto');

const visitorPassSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  visitorName: { type: String, required: true },
  visitorPhone: { type: String, required: true },
  qrCodeId: { 
    type: String, 
    default: () => crypto.randomUUID(), 
    unique: true 
  },
  status: { type: String, enum: ['active', 'revoked'], default: 'active' },
  isInside: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('VisitorPass', visitorPassSchema);
