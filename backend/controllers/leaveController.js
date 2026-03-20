const { Leave, User, Employee } = require('../models');
const mongoose = require('mongoose');

// Employee: Submit a leave request
const submitLeave = async (req, res) => {
    try {
        const { leaveType, fromDate, toDate, reason } = req.body;
        const userId = req.user.id;

        if (!leaveType || !fromDate || !toDate || !reason) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Calculate number of days
        const from = new Date(fromDate);
        const to = new Date(toDate);
        if (to < from) {
            return res.status(400).json({ error: 'To date must be after From date' });
        }
        const days = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;

        // Get employee name
        const user = await User.findById(userId);
        const employee = await Employee.findOne({ userId });
        const employeeName = employee && employee.firstName 
            ? `${employee.firstName} ${employee.lastName}`.trim()
            : user.email.split('@')[0];

        const leave = new Leave({
            userId,
            employeeName,
            employeeEmail: user.email,
            leaveType,
            fromDate,
            toDate,
            days,
            reason,
            status: 'Pending'
        });
        await leave.save();

        res.status(201).json({ message: 'Leave request submitted successfully', leave });
    } catch (error) {
        console.error('Submit leave error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Employee: Get own leave requests
const getMyLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(leaves);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// HR/Admin: Get ALL leave requests
const getAllLeaves = async (req, res) => {
    try {
        const { role } = req.user;
        let query = {};

        if (role === 'HR') {
            const nonHrUsers = await User.find({ role: { $ne: 'HR' } }).select('_id');
            const nonHrUserIds = nonHrUsers.map(u => u._id);
            query = { userId: { $in: nonHrUserIds } };
        }

        const leaves = await Leave.find(query).sort({ createdAt: -1 }).populate('userId', 'role');
        
        const formattedLeaves = leaves.map(leave => {
            const leaveObj = leave.toObject();
            if (leaveObj.userId) {
                leaveObj.User = { role: leaveObj.userId.role };
                leaveObj.userId = leaveObj.userId._id; // revert userId to just the ID string natively
            }
            leaveObj.id = leaveObj._id; // Map Mongoose _id to Frontend expected id
            return leaveObj;
        });

        res.json(formattedLeaves);
    } catch (error) {
        console.error('Get all leaves error:', error);
        res.status(500).json({ error: error.message });
    }
};

// HR/Admin: Approve or Reject a leave request
const updateLeaveStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, hrComment } = req.body;
        const { role: currentUserRole } = req.user;

        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ error: 'Status must be Approved or Rejected' });
        }

        const leave = await Leave.findById(id).populate('userId', 'role');

        if (!leave) return res.status(404).json({ error: 'Leave request not found' });

        // Restriction: HR cannot approve/reject another HR's leave
        if (currentUserRole === 'HR' && leave.userId && leave.userId.role === 'HR') {
            return res.status(403).json({ error: 'HR employees cannot approve or reject leaves for other HR staff. This must be done by an Admin.' });
        }

        leave.status = status;
        leave.hrComment = hrComment || '';
        await leave.save();

        res.json({ message: `Leave request ${status.toLowerCase()} successfully`, leave });
    } catch (error) {
        console.error('Update leave status error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Employee: Get leave balance
const getLeaveBalance = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Define total allowances
        const allowances = {
            'Annual Leave': 18,
            'Sick Leave': 10,
            'Casual Leave': 7
        };

        // Get approved leaves grouped by type using MongoDB Aggregation
        const usedLeaves = await Leave.aggregate([
            { $match: { userId: userId, status: 'Approved' } },
            { $group: { _id: '$leaveType', totalUsed: { $sum: '$days' } } }
        ]);

        const usedMap = {};
        usedLeaves.forEach(l => {
            usedMap[l._id] = parseInt(l.totalUsed) || 0;
        });

        // Consolidate balances
        const balances = Object.keys(allowances).map(type => ({
            type,
            total: allowances[type],
            used: usedMap[type] || 0,
            available: allowances[type] - (usedMap[type] || 0)
        }));

        res.json(balances);
    } catch (error) {
        console.error('Get leave balance error:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { submitLeave, getMyLeaves, getAllLeaves, updateLeaveStatus, getLeaveBalance };
