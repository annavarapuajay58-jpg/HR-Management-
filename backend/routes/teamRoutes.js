const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const {
    getAllEmployees,
    getAllProjects,
    createProject,
    getMyProjects,
    getMyInvitations,
    respondToInvitation,
    postIdea,
    getIdeas
} = require('../controllers/teamController');

// Team Lead only
router.get('/employees', authenticateToken, authorizeRole(['Teamlead', 'Admin', 'HR']), getAllEmployees);
router.post('/projects', authenticateToken, authorizeRole(['Teamlead']), createProject);
router.get('/projects', authenticateToken, authorizeRole(['Teamlead']), getMyProjects);
router.get('/all-projects', authenticateToken, authorizeRole(['Admin', 'HR']), getAllProjects);

// Employee only
router.get('/invitations', authenticateToken, authorizeRole(['Employee']), getMyInvitations);
router.patch('/invitations/:id', authenticateToken, authorizeRole(['Employee']), respondToInvitation);

// Any authenticated member (Team Lead or Employee)
router.post('/projects/:id/ideas', authenticateToken, postIdea);
router.get('/projects/:id/ideas', authenticateToken, getIdeas);

module.exports = router;
