const mongoose = require('mongoose');
const crypto = require('crypto');

const taskSchema = new mongoose.Schema({
    _id: { type: String, required: true, default: () => crypto.randomUUID() },
    title: { type: String, required: true },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
    due: { type: Date, required: true },
    project: { type: String, default: 'General' },
    userId: { type: String, ref: 'User', required: true },
    createdBy: { type: String, ref: 'User', required: false }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
