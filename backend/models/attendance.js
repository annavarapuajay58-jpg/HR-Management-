const mongoose = require('mongoose');
const crypto = require('crypto');

const attendanceSchema = new mongoose.Schema({
    _id: { type: String, required: true, default: () => crypto.randomUUID() },
    userId: { type: String, ref: 'User', required: true },
    date: { type: Date, required: true },
    checkIn: { type: Date, default: null },
    checkOut: { type: Date, default: null },
    hoursWorked: { type: Number, default: 0 },
    status: { type: String, default: 'Present' }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
