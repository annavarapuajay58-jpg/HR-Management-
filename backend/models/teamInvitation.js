const mongoose = require('mongoose');
const crypto = require('crypto');

const teamInvitationSchema = new mongoose.Schema({
    _id: { type: String, required: true, default: () => crypto.randomUUID() },
    projectId: { type: String, ref: 'Project', required: true },
    teamLeadId: { type: String, ref: 'User', required: true },
    employeeId: { type: String, ref: 'User', required: true },
    employeeName: { type: String, required: true },
    employeeEmail: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Accepted', 'Rejected'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('TeamInvitation', teamInvitationSchema);
