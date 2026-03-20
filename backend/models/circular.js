const mongoose = require('mongoose');
const crypto = require('crypto');

const circularSchema = new mongoose.Schema({
    _id: { type: String, required: true, default: () => crypto.randomUUID() },
    title: { type: String, required: true },
    content: { type: String, required: true },
    type: { type: String, enum: ['Holiday', 'Event', 'Info'], default: 'Info' },
    date: { type: Date, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Circular', circularSchema);
