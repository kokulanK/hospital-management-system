const mongoose = require('mongoose');

const skinImageSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },

  imageUrl: { 
    type: String, 
    required: true 
  },

  publicId: { 
    type: String,
    required: true
  },

  analysisResult: { 
    type: String, 
    default: '' 
  },

  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('SkinImage', skinImageSchema);