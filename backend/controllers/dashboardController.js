const { User, Employee, Leave, Attendance, Task, Project } = require('../models');
const mongoose = require('mongoose');

const getStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;
        const todayStr = new Date().toISOString().split('T')[0];
        
        const d = new Date();
        const firstDayOfMonthStr = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];

        if (role === 'Employee') {
            // Tasks Pending
            const tasksPending = await Task.countDocuments({
                userId, status: { $ne: 'Completed' }
            });
            
            // Note: MongoDB dates can be tricky with exact matches if stored as ISODates
            // Assuming due dates are stored as Date objects with 00:00:00 UTC time
            const todayDateRange = new Date(todayStr);
            const tomorrowDateRange = new Date(todayDateRange);
            tomorrowDateRange.setDate(tomorrowDateRange.getDate() + 1);

            const tasksDueToday = await Task.countDocuments({
                userId, 
                due: { $gte: todayDateRange, $lt: tomorrowDateRange },
                status: { $ne: 'Completed' }
            });

            // Leave Balance (Calculate available days)
            const allowances = { 'Annual Leave': 18, 'Sick Leave': 10, 'Casual Leave': 7 };
            
            const approvedLeavesSummary = await Leave.aggregate([
                { $match: { userId: userId, status: 'Approved' } },
                { $group: { _id: '$leaveType', totalUsed: { $sum: '$days' } } }
            ]);

            const usedDays = approvedLeavesSummary.reduce((acc, l) => acc + (parseInt(l.totalUsed) || 0), 0);
            const totalAllowance = Object.values(allowances).reduce((a, b) => a + b, 0);
            const leaveBalanceCount = totalAllowance - usedDays;

            // Days Present this month
            const firstDateRange = new Date(firstDayOfMonthStr);
            const daysPresent = await Attendance.countDocuments({
                userId, 
                date: { $gte: firstDateRange },
                status: 'Present'
            });

            // Performance Calculation: (Completed Tasks / Total Tasks)
            const totalTasks = await Task.countDocuments({ userId });
            const completedTasks = await Task.countDocuments({ userId, status: 'Completed' });
            const performanceScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

            return res.json({
                tasksPending,
                tasksDueToday,
                leaveBalance: leaveBalanceCount,
                daysPresent,
                performance: `${performanceScore}%`
            });
        } else {
            // Admin / HR Stats
            const totalEmployees = await User.countDocuments({ role: 'Employee' });
            
            const pendingLeaves = await Leave.countDocuments({ status: 'Pending' });
            
            const activeProjects = await Project.countDocuments();

            const todayDateRange = new Date(todayStr);
            const tomorrowDateRange = new Date(todayDateRange);
            tomorrowDateRange.setDate(tomorrowDateRange.getDate() + 1);

            const todayPresent = await Attendance.countDocuments({
                date: { $gte: todayDateRange, $lt: tomorrowDateRange },
                status: 'Present'
            });

            const attendanceRate = totalEmployees > 0 ? Math.round((todayPresent / totalEmployees) * 100) : 0;

            return res.json({
                totalEmployees,
                pendingLeaves,
                activeProjects,
                attendanceRate: `${attendanceRate}%`
            });
        }
    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getStats };
