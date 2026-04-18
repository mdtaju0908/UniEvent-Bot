const mongoose = require('mongoose');

const volunteerDutySchema = new mongoose.Schema({
  volunteerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  dutyTitle: { type: String, required: true },
  dutyDescription: { type: String, required: true },
  timeSlot: { type: String, required: true },
  status: { type: String, enum: ['Assigned', 'Completed', 'Pending'], default: 'Assigned' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('VolunteerDuty', volunteerDutySchema);
