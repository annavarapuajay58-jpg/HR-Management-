const express = require('express');
const router = express.Router();
const performanceController = require('../controllers/performanceController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Only Admins and HR can see performance reports
router.get('/', authenticateToken, authorizeRole(['Admin', 'HR']), performanceController.getAllPerformance);

module.exports = router;
