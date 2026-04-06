const express = require('express');
const router = express.Router();
const { register, login, adminLogin, verifyMasterPassword, verifyCode, forgotPassword, verifyResetCode, resetPassword, switchRole, getProfile, verifyAdminOTP, updateProfile, resendVerification } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

router.post('api/auth/register', register);
router.post('api/auth/login', login);
router.post('api/auth/admin-login', adminLogin);
router.post('api/auth/verify-master-password', verifyMasterPassword);
router.post('api/auth/verify-code', verifyCode);
router.post('api/auth/forgot-password', forgotPassword);
router.post('api/auth/verify-reset-code', verifyResetCode);
router.post('api/auth/reset-password', resetPassword);
router.post('api/auth/verify-admin-otp', verifyAdminOTP);
router.post('api/auth/resend-verification', resendVerification);
router.post('api/auth/switch-role', authenticateToken, switchRole);
router.get('api/auth/profile', authenticateToken, getProfile);
router.put('api/auth/update-profile', authenticateToken, updateProfile);

module.exports = router;
