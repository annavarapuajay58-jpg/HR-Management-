const { User, Employee } = require('../models');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendVerificationCode, sendPasswordResetCode } = require('../config/email');

const register = async (req, res) => {
    try {
        const { email, password, role, firstName, lastName, employeeId, phone } = req.body;

        if (!employeeId) {
            return res.status(400).json({ error: 'Employee ID is required' });
        }

        // Check if user already exists by email
        const existingUserByEmail = await User.findOne({ email });

        // If user exists but is NOT verified, resend verification code
        if (existingUserByEmail && !existingUserByEmail.isVerified) {
            const newCode = Math.floor(100000 + Math.random() * 900000).toString();
            await User.updateOne(
                { _id: existingUserByEmail._id },
                { verificationCode: newCode }
            );
            sendVerificationCode(email, newCode).catch(mailError => {
                console.error('Failed to resend verification email:', mailError);
            });
            return res.status(200).json({
                message: 'A new verification code has been sent to your email. Please verify to activate your account.',
                email,
                resent: true
            });
        }

        // Check if user or employeeId already exists
        const existingUser = await User.findOne({ 
            $or: [{ email }, { employeeId }]
        });
        
        if (existingUser) {
            const field = existingUser.email === email ? 'Email' : 'Employee ID';
            return res.status(400).json({ error: `${field} already registered` });
        }

        // Restrict Admin and HR to only one user each
        if (role === 'Admin' || role === 'HR') {
            const roleCount = await User.countDocuments({ role });
            if (roleCount >= 1) {
                return res.status(400).json({ error: `An ${role} already exists. Only one ${role} is allowed.` });
            }
        }

        // Generate 6-digit verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Create User
        console.log('Registering user with data:', { email, role, firstName, lastName, employeeId, phone });
        const user = new User({
            email,
            employeeId,
            password,
            role,
            firstName,
            lastName,
            verificationCode
        });
        await user.save();

        console.log('User created successfully:', user._id);

        // Create profile record for Employee/Teamlead (unified model)
        if (role === 'Employee' || role === 'Teamlead' || role === 'HR') {
            await Employee.create({
                userId: user._id,
                firstName,
                lastName,
                phone: phone || ''
            });
            console.log('Employee profile created for:', user._id);
        }

        // Send Verification Email (Asynchronously) 
        sendVerificationCode(email, verificationCode).catch(mailError => {
            console.error('Failed to send verification email:', mailError);
        });

        res.status(201).json({
            message: 'User registered successfully. Please check your email for the 6-digit verification code.',
            email // Return email so frontend can pass it to verification page
        });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(400).json({ error: error.message });
    }
};

const verifyCode = async (req, res) => {
    try {
        const { email, code } = req.body;
        const user = await User.findOne({ email, verificationCode: code });

        if (!user) {
            return res.status(400).json({ error: 'Invalid verification code' });
        }

        await User.updateOne(
            { _id: user._id },
            { isVerified: true, verificationCode: null }
        );

        res.json({ message: 'Email verified successfully. You can now login.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        // Always return success to avoid email enumeration
        if (!user) {
            return res.json({ message: 'If that email is registered, a password reset code has been sent.' });
        }

        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        const resetExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await User.updateOne(
            { _id: user._id },
            { verificationCode: resetCode, resetCodeExpiry: resetExpiry }
        );

        sendPasswordResetCode(email, resetCode).catch(err => {
            console.error('Failed to send reset email:', err);
        });

        res.json({ message: 'If that email is registered, a password reset code has been sent.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const verifyResetCode = async (req, res) => {
    try {
        const { email, code } = req.body;
        const user = await User.findOne({ email, verificationCode: code });

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired reset code.' });
        }

        // Check expiry if it exists
        if (user.resetCodeExpiry && new Date() > new Date(user.resetCodeExpiry)) {
            return res.status(400).json({ error: 'Reset code has expired. Please request a new one.' });
        }

        res.json({ message: 'Code verified. You may now reset your password.', valid: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, code, password } = req.body;
        const user = await User.findOne({ email, verificationCode: code });

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired reset code.' });
        }

        if (user.resetCodeExpiry && new Date() > new Date(user.resetCodeExpiry)) {
            return res.status(400).json({ error: 'Reset code has expired. Please request a new one.' });
        }

        user.password = password;
        user.verificationCode = null;
        user.resetCodeExpiry = null;
        await user.save(); // pre-save hook handles hashing

        res.json({ message: 'Password reset successfully. You can now login with your new password.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ error: 'No account found with this email address.' });
        }

        const isPasswordValid = await user.validPassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Incorrect password. Please try again.' });
        }

        if (!user.isVerified) {
            const newCode = Math.floor(100000 + Math.random() * 900000).toString();
            await User.updateOne(
                { _id: user._id },
                { verificationCode: newCode }
            );
            sendVerificationCode(email, newCode).catch(mailError => {
                console.error('Failed to resend verification email:', mailError);
            });
            return res.status(403).json({ 
                error: 'Your email is not verified. A new verification code has been sent to your email.',
                needsVerification: true,
                email 
            });
        }

        if (user.role === 'Admin') {
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
            const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); 

            await User.updateOne(
                { _id: user._id },
                { verificationCode: otpCode, resetCodeExpiry: otpExpiry }
            );

            sendVerificationCode(email, otpCode).catch(mailError => {
                console.error('Failed to send Admin OTP:', mailError);
            });

            return res.status(200).json({ 
                otpRequired: true, 
                message: 'Admin OTP sent to your email.' 
            });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'your_super_secret_key',
            { expiresIn: '24h' }
        );

        const employeeProfile = await Employee.findOne({ userId: user._id });

        res.json({ 
            token, 
            user: { 
                id: user._id, 
                email: user.email, 
                role: user.role,
                firstName: user.firstName || employeeProfile?.firstName || 'N/A',
                lastName: user.lastName || employeeProfile?.lastName || 'N/A'
            } 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const verifyMasterPassword = async (req, res) => {
    try {
        const { password } = req.body;
        const masterPassword = process.env.ADMIN_MASTER_PASSWORD || 'novaadmin123';
        
        if (password !== masterPassword) {
            return res.status(401).json({ error: 'Incorrect Master Password.' });
        }
        
        return res.status(200).json({ valid: true, message: 'Password accepted' });
    } catch (error) {
        res.status(500).json({ error: 'Server error verifying password' });
    }
};

const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const masterPassword = process.env.ADMIN_MASTER_PASSWORD || 'novaadmin123';
        
        if (password !== masterPassword) {
            return res.status(401).json({ error: 'Incorrect Master Password. Please try again.' });
        }

        let user = await User.findOne({ email });

        if (user) {
            if (user.role !== 'Admin') {
                return res.status(403).json({ error: 'This email is already registered as an Employee. Please use a different email for Admin.' });
            }
        } else {
            user = new User({
                email,
                employeeId: 'ADMIN-' + Date.now(),
                password: crypto.randomBytes(16).toString('hex'), 
                role: 'Admin',
                firstName: 'Admin',
                lastName: 'User',
                isVerified: true
            });
            await user.save();
        }

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); 

        await User.updateOne(
            { _id: user._id },
            { verificationCode: otpCode, resetCodeExpiry: otpExpiry }
        );

        sendVerificationCode(email, otpCode).catch(mailError => {
            console.error('Failed to send Admin OTP:', mailError);
        });

        console.log(`[ADMIN LOGIN] Generated OTP for ${email}: ${otpCode}`);

        return res.status(200).json({ 
            otpRequired: true, 
            message: 'Master Password accepted. Admin OTP sent to your email.' 
        });

    } catch (error) {
        console.error('adminLogin Error:', error);
        res.status(500).json({ error: 'Server error during admin login', details: error.message, stack: error.stack });
    }
};

const verifyAdminOTP = async (req, res) => {
    try {
        const { email, code } = req.body;
        const user = await User.findOne({ email, verificationCode: code, role: 'Admin' });

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired OTP code.' });
        }

        if (user.resetCodeExpiry && new Date() > new Date(user.resetCodeExpiry)) {
            return res.status(400).json({ error: 'OTP code has expired.' });
        }

        await User.updateOne(
            { _id: user._id },
            { verificationCode: null, resetCodeExpiry: null }
        );

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'your_super_secret_key',
            { expiresIn: '24h' }
        );

        const employeeProfile = await Employee.findOne({ userId: user._id });

        res.json({ 
            token, 
            user: { 
                id: user._id, 
                email: user.email, 
                role: user.role,
                firstName: user.firstName || employeeProfile?.firstName || 'N/A',
                lastName: user.lastName || employeeProfile?.lastName || 'N/A'
            } 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const switchRole = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) return res.status(404).json({ error: 'User not found' });

        if (user.role !== 'Employee' && user.role !== 'Teamlead' && user.role !== 'HR') {
            return res.status(400).json({ error: 'Only Employees, Team Leads, and HR can switch roles.' });
        }

        let newRole;
        if (user.role === 'HR') {
            newRole = 'Employee';
        } else {
            newRole = user.role === 'Employee' ? 'Teamlead' : 'Employee';
        }
        
        user.role = newRole;
        await user.save();

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'your_super_secret_key',
            { expiresIn: '24h' }
        );

        const employeeProfile = await Employee.findOne({ userId: user._id });

        res.json({
            message: `Role switched to ${newRole} successfully.`,
            token,
            user: { 
                id: user._id, 
                email: user.email, 
                role: user.role,
                firstName: user.firstName || employeeProfile?.firstName || 'N/A',
                lastName: user.lastName || employeeProfile?.lastName || 'N/A'
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('-password -verificationCode -resetCodeExpiry');

        if (!user) return res.status(404).json({ error: 'User not found' });

        const employeeProfile = await Employee.findOne({ userId: user._id });

        const profileData = {
            id: user._id,
            email: user.email,
            role: user.role,
            firstName: user.firstName || employeeProfile?.firstName || 'N/A',
            lastName: user.lastName || employeeProfile?.lastName || 'N/A',
            phone: employeeProfile?.phone || 'N/A',
            profileImage: employeeProfile?.profileImage || null,
            employeeId: user.employeeId || 'N/A',
            isVerified: user.isVerified,
            createdAt: user.createdAt
        };

        res.json(profileData);
    } catch (error) {
        console.error('getProfile Error:', error);
        res.status(500).json({ error: error.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { firstName, lastName, phone, profileImage } = req.body;

        if (!firstName || !lastName) {
            return res.status(400).json({ error: 'First Name and Last Name are required' });
        }

        await User.updateOne({ _id: userId }, { firstName, lastName });

        const user = await User.findById(userId);
        
        if (user.role === 'Employee' || user.role === 'Teamlead' || user.role === 'HR') {
            await Employee.findOneAndUpdate(
                { userId },
                { firstName, lastName, phone, profileImage },
                { upsert: true, new: true }
            );
        }

        const employeeProfile = await Employee.findOne({ userId: user._id });

        const profileData = {
            id: user._id,
            email: user.email,
            role: user.role,
            firstName: user.firstName || employeeProfile?.firstName || 'N/A',
            lastName: user.lastName || employeeProfile?.lastName || 'N/A',
            phone: employeeProfile?.phone || 'N/A',
            profileImage: employeeProfile?.profileImage || null,
            employeeId: user.employeeId || 'N/A'
        };

        res.json({ message: 'Profile updated successfully', user: profileData });
    } catch (error) {
        console.error('updateProfile Error:', error);
        res.status(500).json({ error: error.message });
    }
};

const resendVerification = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email is required.' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.json({ message: 'If this email is registered, a verification code has been sent.' });
        }

        if (user.isVerified) {
            return res.json({ message: 'Your account is already verified. Please login.' });
        }

        const newCode = Math.floor(100000 + Math.random() * 900000).toString();
        await User.updateOne(
            { _id: user._id },
            { verificationCode: newCode }
        );

        sendVerificationCode(email, newCode).catch(mailError => {
            console.error('Failed to resend verification email:', mailError);
        });

        res.json({ message: 'A new verification code has been sent to your email.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { register, login, adminLogin, verifyMasterPassword, verifyCode, forgotPassword, verifyResetCode, resetPassword, switchRole, getProfile, verifyAdminOTP, updateProfile, resendVerification };
