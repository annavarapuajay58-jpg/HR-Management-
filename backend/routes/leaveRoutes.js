const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { submitLeave, getMyLeaves, getAllLeaves, updateLeaveStatus, getLeaveBalance } = require('../controllers/leaveController');

// Employee: submit and view own leaves
router.post('/', authenticateToken, submitLeave);
router.get('/my', authenticateToken, getMyLeaves);
router.get('/balance', authenticateToken, getLeaveBalance);

// HR / Admin: view all and update status
router.get('/all', authenticateToken, authorizeRole(['HR', 'Admin']), getAllLeaves);
router.patch('/:id/status', authenticateToken, authorizeRole(['HR', 'Admin']), updateLeaveStatus);

module.exports = router;
