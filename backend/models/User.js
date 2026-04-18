const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'volunteer', 'faculty', 'user', 'owner'], default: 'user' },
  uniqueCode: { type: String, unique: true, sparse: true },
  formResponses: { type: Array, default: [] }, // Store form responses here
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Admin who created this user (via form or direct)
  
  // Volunteer Assignment Fields
  assignedAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  assignedAt: { type: Date },

  approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected', 'blocked'], default: 'pending' }, // Default pending for safety
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
