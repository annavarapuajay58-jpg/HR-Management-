const mongoose = require('mongoose');
const crypto = require('crypto');

const leaveSchema = new mongoose.Schema({
    _id: { type: String, required: true, default: () => crypto.randomUUID() },
    userId: {
        type: String,
        ref: 'User',
        required: true
    },
    employeeName: {
        type: String,
        required: true
    },
    employeeEmail: {
        type: String,
        required: true
    },
    leaveType: {
        type: String,
        required: true
    },
    fromDate: {
        type: Date,
        required: true
    },
    toDate: {
        type: Date,
        required: true
    },
    days: {
        type: Number,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    hrComment: {
        type: String,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('Leave', leaveSchema);
