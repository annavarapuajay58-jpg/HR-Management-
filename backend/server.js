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
const connectDB = require('./config/mongodb');

const app = express();
const PORT = process.env.PORT || 5000;
const mongoose = require('mongoose');

// ✅ Middleware to check DB connection status
const checkDbConnection = (req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ 
            error: "Database Connection Failed", 
            message: "The backend is unable to connect to MongoDB. Please ensure IP 0.0.0.0/0 is whitelisted in MongoDB Atlas." 
        });
    }
    next();
};


// ✅ CORS (important for Netlify frontend)
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://hr-management-2.netlify.app' // Update this with your actual Netlify URL if different
];

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            // Allow all origins for now to avoid blocking, but you should restrict this later
            return callback(null, true);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ Body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));


// ================= ROUTES =================

// Apply DB check to all API routes
app.use('/api', checkDbConnection);

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
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
    }
};

startServer();