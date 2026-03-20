const mongoose = require('mongoose');
const crypto = require('crypto');

const projectSchema = new mongoose.Schema({
    _id: { type: String, required: true, default: () => crypto.randomUUID() },
    teamLeadId: { type: String, ref: 'User', required: true },
    teamLeadName: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    deadline: { type: Date },
    status: { type: String, enum: ['Active', 'Completed', 'On Hold'], default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
