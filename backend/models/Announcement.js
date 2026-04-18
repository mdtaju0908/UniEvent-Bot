const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  message: { type: String, required: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  type: { type: String, enum: ['General', 'Emergency'], default: 'General' },
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);
