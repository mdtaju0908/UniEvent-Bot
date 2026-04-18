const mongoose = require('mongoose');

const formResponseSchema = new mongoose.Schema({
  formId: { type: mongoose.Schema.Types.ObjectId, ref: 'Form', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  responses: { type: Map, of: String }, // Flexible key-value storage
  uniqueCode: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('FormResponse', formResponseSchema);
