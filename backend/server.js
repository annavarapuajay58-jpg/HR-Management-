require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Routes
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

// DB
const connectDB = require('./config/mongodb');

const app = express();
const PORT = process.env.PORT || 5000;


// ✅ Middleware to check DB connection
const checkDbConnection = (req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
            error: "Database Connection Failed",
            message: "MongoDB not connected"
        });
    }
    next();
};


// ✅ CORS
app.use(cors({
    origin: true,
    credentials: true
}));


// ✅ Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ================= ROUTES =================
app.use('/api', checkDbConnection);

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


// ================= HEALTH =================
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Backend running'
    });
});


// ================= ROOT =================
app.get('/', (req, res) => {
    res.send('🚀 HR Management Backend Running');
});


// ================= START SERVER =================
const startServer = async () => {
    try {
        await connectDB(); // try DB connect
    } catch (err) {
        console.log("DB connection failed, continuing...");
    }

    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
};

startServer();