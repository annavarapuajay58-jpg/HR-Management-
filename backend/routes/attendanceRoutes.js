const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authenticateToken } = require('../middleware/auth');

router.post('/check-in', authenticateToken, attendanceController.checkIn);
router.post('/check-out', authenticateToken, attendanceController.checkOut);
router.get('/my', authenticateToken, attendanceController.getMyAttendance);
router.get('/all', authenticateToken, attendanceController.getAllAttendance);
router.get('/today', authenticateToken, attendanceController.getTodayStatus);

module.exports = router;
