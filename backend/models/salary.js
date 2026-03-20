const mongoose = require('mongoose');
const crypto = require('crypto');

const salarySchema = new mongoose.Schema({
    _id: { type: String, required: true, default: () => crypto.randomUUID() },
    employeeId: { type: String, ref: 'Employee', required: true },
    basicSalary: { type: Number, default: 0 },
    bonus: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    netSalary: { type: Number, default: 0 },
    month: { type: String, default: null },
    year: { type: Number, default: null },
    status: { type: String, default: 'Paid' }
}, { timestamps: true });

module.exports = mongoose.model('Salary', salarySchema);
