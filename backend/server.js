require('dotenv').config();

const express = require('express');
const cors = require('cors');

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

// MongoDB Connection
require('./config/mongodb');

const app = express();
const PORT = process.env.PORT || 5000;


// ✅ CORS (important for Netlify frontend)
app.use(cors({
    origin: "*",   // production lo frontend URL pettavachu
    credentials: true
}));

// ✅ Body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));


// ================= ROUTES =================

// Auth
app.use('/api/auth', authRoutes);

// Other modules
app.use('/api/leaves', leaveRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/circulars', circularRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/payslips', payslipRoutes);


// ================= HEALTH CHECK =================
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'HR MS Backend is running',
    });
});


// ================= DEFAULT ROUTE =================
app.get('/', (req, res) => {
    res.send('HR Management Backend Running 🚀');
});


// ================= SERVER START =================
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});