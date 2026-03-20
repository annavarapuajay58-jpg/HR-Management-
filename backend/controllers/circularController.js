const { Circular } = require('../models');

const createCircular = async (req, res) => {
    try {
        const { title, content, type, date } = req.body;
        if (!title || !content || !date) {
            return res.status(400).json({ error: 'Title, content and date are required' });
        }

        const circular = new Circular({ title, content, type, date });
        await circular.save();
        res.status(201).json({ message: 'Circular posted successfully', circular });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAllCirculars = async (req, res) => {
    try {
        const circulars = await Circular.find().sort({ date: -1, createdAt: -1 });
        res.json(circulars);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteCircular = async (req, res) => {
    try {
        const { id } = req.params;
        const circular = await Circular.findById(id);
        if (!circular) return res.status(404).json({ error: 'Circular not found' });

        await circular.deleteOne();
        res.json({ message: 'Circular deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createCircular, getAllCirculars, deleteCircular };
