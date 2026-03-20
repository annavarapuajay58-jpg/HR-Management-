import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyCode from './pages/VerifyCode';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Overview from './pages/dashboard/Overview';
import MyTasks from './pages/dashboard/MyTasks';
import MyLeave from './pages/dashboard/MyLeave';
import MyAttendance from './pages/dashboard/MyAttendance';
import AllAttendance from './pages/dashboard/AllAttendance';
import LeaveRequests from './pages/dashboard/LeaveRequests';
import ManageCirculars from './pages/dashboard/ManageCirculars';
import MyTeam from './pages/dashboard/MyTeam';
import MyProject from './pages/dashboard/MyProject';
import Profile from './pages/dashboard/Profile';
import ManageTasks from './pages/dashboard/ManageTasks';
import Performance from './pages/dashboard/Performance';
import Payroll from './pages/dashboard/Payroll';
import MyPayslips from './pages/dashboard/MyPayslips';
import Employees from './pages/dashboard/Employees';
import Projects from './pages/dashboard/Projects';
import AdminGate from './pages/AdminGate';
import AdminLogin from './pages/AdminLogin';

import RoleBasedRoute from './components/RoleBasedRoute';

// PrivateRoute re-evaluates the token on every navigation
const PrivateRoute = () => {
    const isAuthenticated = !!localStorage.getItem('token');
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/verify-code" element={<VerifyCode />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                <Route path="/admin" element={<AdminGate />} />
                <Route path="/admin-login" element={<AdminLogin />} />


                {/* Protected dashboard routes */}
                <Route element={<PrivateRoute />}>
                    <Route path="/dashboard" element={<Dashboard />}>
                        {/* Default redirect to overview */}
                        <Route index element={<Navigate to="overview" replace />} />
                        <Route path="overview" element={<Overview />} />
                        <Route path="my-tasks" element={<MyTasks />} />
                        <Route path="my-leave" element={<MyLeave />} />
                        <Route path="my-attendance" element={<MyAttendance />} />
                        <Route path="my-team" element={<MyTeam />} />
                        <Route path="my-project" element={<MyProject />} />
                        <Route path="my-payslips" element={<MyPayslips />} />
                        <Route path="profile" element={<Profile />} />

                        {/* Restricted routes for HR/Admin */}
                        <Route element={<RoleBasedRoute allowedRoles={['Admin', 'HR']} />}>
                            <Route path="employees" element={<Employees />} />
                            <Route path="attendance" element={<AllAttendance />} />
                            <Route path="leaves" element={<LeaveRequests />} />
                            <Route path="performance" element={<Performance />} />
                            <Route path="payroll" element={<Payroll />} />
                            <Route path="circulars" element={<ManageCirculars />} />
                        </Route>

                        {/* Restricted routes for Admin/Teamlead (Project management) */}
                        <Route element={<RoleBasedRoute allowedRoles={['Admin', 'Teamlead', 'HR']} />}>
                            <Route path="projects" element={<Projects />} />
                            <Route path="tasks" element={<ManageTasks />} />
                        </Route>
                    </Route>
                </Route>

                <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
        </Router>
    );
}

const PlaceholderPage = ({ title }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '1rem' }}>
        <div style={{ fontSize: '3rem' }}>🚧</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b' }}>{title}</h2>
        <p style={{ color: '#94a3b8' }}>This module is coming soon.</p>
    </div>
);

export default App;
