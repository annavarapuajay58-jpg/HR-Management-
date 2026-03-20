const express = require('express');
const router = express.Router();
const { getEmployeesWithSalaries, updateSalary } = require('../controllers/payrollController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Protect all routes
router.use(authenticateToken);
router.use(authorizeRole(['Admin', 'HR']));

router.get('/employees', getEmployeesWithSalaries);
router.put('/update-salary/:id', updateSalary);

module.exports = router;
