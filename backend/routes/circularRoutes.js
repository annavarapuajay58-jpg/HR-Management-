const express = require('express');
const router = express.Router();
const circularController = require('../controllers/circularController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

router.get('/', authenticateToken, circularController.getAllCirculars);
router.post('/', authenticateToken, authorizeRole(['Admin', 'HR']), circularController.createCircular);
router.delete('/:id', authenticateToken, authorizeRole(['Admin', 'HR']), circularController.deleteCircular);

module.exports = router;
