const { User, Employee, Task, Attendance, Leave } = require('../models');
const mongoose = require('mongoose');

const getAllPerformance = async (req, res) => {
    try {
        const employees = await User.find({ 
            role: { $in: ['Employee', 'Teamlead'] }
        }).select('_id email firstName lastName').lean();

        const userIds = employees.map(e => e._id);
        const employeeProfiles = await Employee.find({ userId: { $in: userIds } });
        
        const profileMap = {};
        employeeProfiles.forEach(ep => profileMap[ep.userId.toString()] = ep);

        const today = new Date();
        const firstDayOfMonthStr = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        const dateTodayStr = today.toISOString().split('T')[0];

        const firstDateObj = new Date(firstDayOfMonthStr);
        const todayDateObj = new Date(dateTodayStr);
        todayDateObj.setDate(todayDateObj.getDate() + 1); // up to end of today

        // Use Promise.all to fetch metrics concurrently per user
        const performanceData = await Promise.all(employees.map(async (u) => {
            const userId = u._id;

            // 1. Task Accuracy
            const totalTasks = await Task.countDocuments({ userId });
            const completedTasks = await Task.countDocuments({ userId, status: 'Completed' });
            const taskAccuracy = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

            // 2. Attendance Rate
            const daysPresent = await Attendance.countDocuments({
                userId, 
                date: { $gte: firstDateObj, $lt: todayDateObj },
                status: 'Present'
            });
            const attendanceRate = Math.min(100, Math.round((daysPresent / 22) * 100));

            // 3. Leave Count
            const leaveAgg = await Leave.aggregate([
                { $match: { userId: userId, status: 'Approved' } },
                { $group: { _id: null, totalDays: { $sum: '$days' } } }
            ]);
            const leaveDays = leaveAgg.length > 0 ? leaveAgg[0].totalDays : 0;

            const ep = profileMap[userId.toString()];

            const name = (u.firstName && u.firstName !== 'N/A') 
                ? `${u.firstName} ${u.lastName || ''}`.trim()
                : ep && ep.firstName 
                    ? `${ep.firstName} ${ep.lastName || ''}`.trim()
                    : u.email.split('@')[0];

            return {
                id: userId,
                name,
                email: u.email,
                designation: ep?.designation || 'N/A',
                department: ep?.department || 'N/A',
                metrics: {
                    taskAccuracy,
                    attendanceRate,
                    leaveDays
                },
                score: Math.round((taskAccuracy * 0.7) + (attendanceRate * 0.3)) // Simple weighted score
            };
        }));

        // Sort by score descending
        performanceData.sort((a, b) => b.score - a.score);

        res.json(performanceData);
    } catch (error) {
        console.error('Performance Data Error:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getAllPerformance };
