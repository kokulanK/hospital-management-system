const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ward: { type: mongoose.Schema.Types.ObjectId, ref: 'Ward' },
  bed: { type: mongoose.Schema.Types.ObjectId, ref: 'Bed' },
  status: { 
    type: String, 
    enum: ['pending_allocation', 'admitted', 'discharged'], 
    default: 'pending_allocation' 
  },
  admissionDate: { type: Date },
  dischargeDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Admission', admissionSchema);
