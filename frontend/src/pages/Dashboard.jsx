import React from 'react';
import { useNavigate, NavLink, Outlet } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Briefcase,
    CheckSquare,
    Clock,
    Calendar,
    CreditCard,
    LogOut,
    FolderKanban,
    Rocket,
    Megaphone
} from 'lucide-react';

const menuItems = [
    { to: '/dashboard/overview', icon: <LayoutDashboard size={20} />, label: 'Dashboard', roles: ['Admin', 'HR', 'Teamlead', 'Employee'] },
    { to: '/dashboard/employees', icon: <Users size={20} />, label: 'Employees', roles: ['Admin', 'HR'] },
    { to: '/dashboard/projects', icon: <Briefcase size={20} />, label: 'Projects', roles: ['Admin', 'Teamlead', 'HR'] },
    { to: '/dashboard/tasks', icon: <CheckSquare size={20} />, label: 'Tasks', roles: ['Admin', 'Teamlead', 'HR'] },
    { to: '/dashboard/attendance', icon: <Clock size={20} />, label: 'All Attendance', roles: ['Admin', 'HR'] },
    { to: '/dashboard/leaves', icon: <Calendar size={20} />, label: 'All Leaves', roles: ['Admin', 'HR'] },
    { to: '/dashboard/circulars', icon: <Megaphone size={20} />, label: 'Manage Circulars', roles: ['Admin', 'HR'] },
    { to: '/dashboard/performance', icon: <Users size={20} />, label: 'Performance', roles: ['Admin', 'HR'] },
    { to: '/dashboard/payroll', icon: <CreditCard size={20} />, label: 'Payroll', roles: ['Admin', 'HR'] },
    // Employee/Teamlead specific (Personal)
    { to: '/dashboard/my-tasks', icon: <CheckSquare size={20} />, label: 'My Tasks', roles: ['Employee', 'Teamlead', 'HR'] },
    { to: '/dashboard/my-leave', icon: <Calendar size={20} />, label: 'My Leave', roles: ['Employee', 'Teamlead', 'HR'] },
    { to: '/dashboard/my-attendance', icon: <Clock size={20} />, label: 'My Attendance', roles: ['Employee', 'Teamlead', 'HR'] },
    { to: '/dashboard/my-project', icon: <Rocket size={20} />, label: 'My Project', roles: ['Employee', 'Teamlead', 'HR'] },
    { to: '/dashboard/my-payslips', icon: <CreditCard size={20} />, label: 'My Payslips', roles: ['Employee', 'Teamlead', 'HR', 'Admin'] },
    // Teamlead-specific
    { to: '/dashboard/my-team', icon: <FolderKanban size={20} />, label: 'My Team', roles: ['Teamlead'] },
];

const NavItem = ({ to, icon, label }) => (
    <NavLink
        to={to}
        className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
    >
        {icon}
        <span>{label}</span>
    </NavLink>
);

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = React.useState(JSON.parse(localStorage.getItem('user') || '{}'));
    const role = user.role;

    React.useEffect(() => {
        const handleUserUpdate = () => {
            const updatedUser = JSON.parse(localStorage.getItem('user') || '{}');
            setUser(updatedUser);
        };

        window.addEventListener('userUpdate', handleUserUpdate);
        return () => window.removeEventListener('userUpdate', handleUserUpdate);
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const handleSwitchRole = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/auth/switch-role', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                // Reload to refresh the menu and role-based views
                window.location.reload();
            } else {
                alert(data.error || 'Failed to switch role');
            }
        } catch (error) {
            console.error('Switch role error:', error);
            alert('An error occurred while switching roles');
        }
    };

    const visibleItems = menuItems.filter(item => item.roles.includes(role));

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <div className="sidebar">
                <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img src="/logo.jpeg" alt="Logo" style={{ width: '40px', height: '40px', borderRadius: '0.5rem', objectFit: 'contain', flexShrink: 0 }} />
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white' }}>Nova HamoTech</h2>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {visibleItems.map((item, index) => (
                        <NavItem key={index} {...item} />
                    ))}
                </nav>

                <div style={{ marginTop: 'auto', paddingTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {(role === 'Employee' || role === 'Teamlead' || role === 'HR') && (
                        <button
                            onClick={handleSwitchRole}
                            className="sidebar-logout-btn"
                            style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'white', border: 'none', marginBottom: '0.5rem' }}
                        >
                            <Rocket size={20} />
                            Switch to {role === 'Employee' ? 'Teamlead' : 'Employee'}
                        </button>
                    )}
                    <button
                        onClick={handleLogout}
                        className="sidebar-logout-btn"
                    >
                        <LogOut size={20} />
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Main Content — child routes render here */}
            <div className="main-content">
                <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                            Welcome, {user.firstName && user.firstName !== 'N/A' ? `${user.firstName} ${user.lastName}` : (user.email?.split('@')[0] || 'User')}
                        </h1>
                        <p style={{ color: 'var(--text-muted)' }}>
                            Role: <span style={{ color: 'var(--primary)', fontWeight: '600' }}>{role}</span>
                        </p>
                    </div>
                    <button 
                        onClick={() => navigate('/dashboard/profile')}
                        className="card" 
                        style={{ 
                            padding: '0.4rem 0.8rem', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.75rem', 
                            cursor: 'pointer',
                            border: '1.5px solid #e2e8f0',
                            transition: 'all 0.2s',
                            background: 'white',
                            borderRadius: '2rem',
                            outline: 'none'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                        onMouseOut={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                    >
                        <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b' }}>{role}</span>
                        <div style={{ 
                            width: '32px', 
                            height: '32px', 
                            borderRadius: '50%', 
                            background: 'linear-gradient(45deg, var(--primary), #a855f7)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: '700',
                            fontSize: '0.9rem',
                            textTransform: 'uppercase'
                        }}>
                            {user.firstName?.[0] || user.email?.[0]}
                        </div>
                    </button>
                </header>

                {/* Sub-page content */}
                <Outlet />
            </div>
        </div>
    );
};

export default Dashboard;
