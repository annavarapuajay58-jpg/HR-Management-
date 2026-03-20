const mongoose = require('mongoose');
const crypto = require('crypto');

const employeeSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        default: () => crypto.randomUUID()
    },
    userId: {
        type: String,
        ref: 'User',
        required: true,
        unique: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    phone: { type: String, default: '' },
    profileImage: { type: String, default: '' },
    address: { type: String, default: '' },
    designation: { type: String, default: '' },
    department: { type: String, default: '' },
    baseSalary: {
        type: Number,
        default: 0
    },
    bonus: {
        type: Number,
        default: 0
    },
    deductions: {
        type: Number,
        default: 0
    },
    netSalary: {
        type: Number,
        default: 0
    },
    joiningDate: { type: String, default: '' },
    status: {
        type: String,
        default: 'Active'
    }
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);
