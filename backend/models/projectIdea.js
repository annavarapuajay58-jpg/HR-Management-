const mongoose = require('mongoose');

const projectIdeaSchema = new mongoose.Schema({
    projectId: { type: String, ref: 'Project', required: true },
    authorId: { type: String, ref: 'User', required: true },
    authorName: { type: String, required: true },
    authorRole: { type: String, required: true },
    idea: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('ProjectIdea', projectIdeaSchema);
