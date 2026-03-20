const { Attendance, User } = require('../models');

const checkIn = async (req, res) => {
    try {
        const userId = req.user.id;
        const date = new Date();
        date.setUTCHours(0,0,0,0);

        // Check if already checked in today
        let attendance = await Attendance.findOne({
            userId, date
        });

        if (attendance) {
            return res.status(400).json({ error: 'Already checked in today' });
        }

        attendance = new Attendance({
            userId,
            date,
            checkIn: new Date(),
            status: 'Present'
        });
        await attendance.save();

        res.status(201).json({ message: 'Checked in successfully', attendance });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const checkOut = async (req, res) => {
    try {
        const userId = req.user.id;
        const date = new Date();
        date.setUTCHours(0,0,0,0);

        const attendance = await Attendance.findOne({
            userId, date
        });

        if (!attendance) {
            return res.status(404).json({ error: 'Check-in record not found for today' });
        }

        if (attendance.checkOut) {
            return res.status(400).json({ error: 'Already checked out today' });
        }

        const checkOutTime = new Date();
        const checkInTime = new Date(attendance.checkIn);
        const diffMs = checkOutTime - checkInTime;
        const hoursWorked = (diffMs / (1000 * 60 * 60)).toFixed(2);

        attendance.checkOut = checkOutTime;
        attendance.hoursWorked = hoursWorked;
        await attendance.save();

        res.json({ message: 'Checked out successfully', attendance });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getMyAttendance = async (req, res) => {
    try {
        const userId = req.user.id;
        const attendance = await Attendance.find({ userId }).sort({ date: -1 });
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAllAttendance = async (req, res) => {
    try {
        if (req.user.role !== 'Admin' && req.user.role !== 'HR') {
            return res.status(403).json({ error: 'Access denied' });
        }

        const attendance = await Attendance.find()
            .populate('userId', 'email firstName lastName role')
            .sort({ date: -1 })
            .lean();
            
        const formatted = attendance.map(a => {
            if (a.userId) {
                a.User = { 
                    email: a.userId.email, 
                    role: a.userId.role,
                    firstName: a.userId.firstName,
                    lastName: a.userId.lastName
                };
                a.userId = a.userId._id;
            } else {
                // Handle orphaned records gracefully
                a.User = { 
                    email: 'Unknown User', 
                    role: 'N/A',
                    firstName: 'Unknown',
                    lastName: `(ID: ${a.userId || 'N/A'})`
                };
            }
            return a;
        });

        res.json(formatted);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getTodayStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const date = new Date();
        date.setUTCHours(0,0,0,0);
        const attendance = await Attendance.findOne({
            userId, date
        });
        res.json(attendance || { message: 'Not checked in' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { checkIn, checkOut, getMyAttendance, getAllAttendance, getTodayStatus };
