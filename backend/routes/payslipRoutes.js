const express = require('express');
const router = express.Router();
const payslipController = require('../controllers/payslipController');
const { authenticateToken } = require('../middleware/auth');

router.get('/my', authenticateToken, payslipController.getMyPayslips);
router.get('/download/:id', authenticateToken, payslipController.downloadPayslip);
router.get('/download-year/:year', authenticateToken, payslipController.downloadYearlyPayslips);

module.exports = router;
