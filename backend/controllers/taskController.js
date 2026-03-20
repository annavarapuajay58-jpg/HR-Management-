const { Task, User, Employee } = require('../models');

const getMyTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ userId: req.user.id }).sort({ due: 1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createTask = async (req, res) => {
    try {
        const { title, priority, status, due, project, assignedTo } = req.body;
        const userId = assignedTo || req.user.id;

        const assignedUser = await User.findById(userId);
        if (assignedUser && assignedUser.role === 'HR' && req.user.role !== 'Admin') {
            return res.status(403).json({ error: 'Only Admins can assign tasks to employees with the HR role.' });
        }
        
        const task = new Task({
            title, priority, status, due, project, userId,
            createdBy: req.user.id
        });
        await task.save();

        res.status(201).json(task);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        
        const isAssigned = task.userId.toString() === req.user.id;
        const isCreator = (task.createdBy || '').toString() === req.user.id;
        const isAdminOrHR = ['Admin', 'HR'].includes(req.user.role);

        if (!isAssigned && !isCreator && !isAdminOrHR) {
            return res.status(403).json({ error: 'You are not authorized to update this task.' });
        }

        task.status = status;
        await task.save();
        res.json(task);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getAssignedTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ createdBy: req.user.id })
            .populate('userId', 'email role firstName lastName')
            .sort({ createdAt: -1 })
            .lean();

        // Populate Employee profile details
        const userIds = tasks.map(t => t.userId?._id).filter(id => id);
        const userProfiles = await Employee.find({ userId: { $in: userIds } });
        
        const formatMap = {};
        userProfiles.forEach(p => formatMap[p.userId.toString()] = p);

        const result = tasks.map(t => {
            if (t.userId) {
                const ep = formatMap[t.userId._id.toString()];
                t.User = {
                    email: t.userId.email,
                    role: t.userId.role,
                    firstName: ep?.firstName || t.userId.firstName,
                    lastName: ep?.lastName || t.userId.lastName,
                    Employee: ep ? { firstName: ep.firstName, lastName: ep.lastName } : null
                };
            }
            return t;
        });

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getMyTasks, createTask, updateTask, getAssignedTasks };
