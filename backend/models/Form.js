const mongoose = require('mongoose');

const formSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  fields: [{
    label: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['text', 'textarea', 'email', 'number', 'select', 'date', 'time', 'checkbox', 'radio', 'section'], 
      default: 'text' 
    },
    required: { type: Boolean, default: false },
    placeholder: { type: String },
    helpText: { type: String },
    options: [{ type: String }], // For select, radio, checkbox
    systemRole: { type: String, enum: ['none', 'name', 'email'], default: 'none' } // Map to user account
  }],
  targetRole: { 
    type: String, 
    enum: ['user', 'volunteer', 'faculty', 'teacher', 'admin'], 
    default: 'user' 
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Form', formSchema);
