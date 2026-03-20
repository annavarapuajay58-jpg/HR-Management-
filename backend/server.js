require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const teamRoutes = require('./routes/teamRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const circularRoutes = require('./routes/circularRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const taskRoutes = require('./routes/taskRoutes');
const performanceRoutes = require('./routes/performanceRoutes');
const payrollRoutes = require('./routes/payrollRoutes');
const payslipRoutes = require('./routes/payslipRoutes');


require("./config/mongodb");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/circulars', circularRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/payslips', payslipRoutes);

// Basic health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'HR MS Backend is running' });
});

async function startServer() {
    try {
        console.log('Starting server...');
        
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Unable to start server:', error.message);
        process.exit(1);
    }
}

startServer();