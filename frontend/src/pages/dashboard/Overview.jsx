import React, { useState, useEffect } from 'react';
import { CheckSquare, Calendar, Clock, TrendingUp, Users, Briefcase, Megaphone, Bell } from 'lucide-react';
import api from '../../api';

const StatCard = ({ title, value, trend, color, icon }) => (
    <div className="card stat-card-hover" style={{ padding: '1.4rem', borderLeft: `4px solid ${color}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '500', marginBottom: '0.4rem' }}>{title}</p>
                <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#1e293b' }}>{value}</h2>
                <p style={{ fontSize: '0.78rem', color, fontWeight: '600', marginTop: '0.4rem' }}>{trend}</p>
            </div>
            <div style={{ width: '44px', height: '44px', borderRadius: '0.75rem', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {React.cloneElement(icon, { color, size: 22 })}
            </div>
        </div>
    </div>
);

const Overview = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user.role;
    const [circulars, setCirculars] = useState([]);
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [circularsRes, statsRes] = await Promise.all([
                api.get('/circulars'),
                api.get('/dashboard/stats')
            ]);
            
            setCirculars(circularsRes.data.slice(0, 5));
            
            const data = statsRes.data;
            if (role === 'Employee') {
                setStats([
                    { title: 'Tasks Pending', value: data.tasksPending, trend: `${data.tasksDueToday} due today`, color: '#6366f1', icon: <CheckSquare /> },
                    { title: 'Leave Balance', value: data.leaveBalance, trend: 'Available days', color: '#22c55e', icon: <Calendar /> },
                    { title: 'Days Present', value: data.daysPresent, trend: 'This month', color: '#f59e0b', icon: <Clock /> },
                    { title: 'Performance', value: data.performance || '87%', trend: 'Overall score', color: '#ec4899', icon: <TrendingUp /> },
                ]);
            } else {
                setStats([
                    { title: 'Total Employees', value: data.totalEmployees, trend: 'Active users', color: '#6366f1', icon: <Users /> },
                    { title: 'Leave Requests', value: data.pendingLeaves, trend: 'Pending approval', color: '#f59e0b', icon: <Calendar /> },
                    { title: 'Active Projects', value: data.activeProjects, trend: 'Current projects', color: '#22c55e', icon: <Briefcase /> },
                    { title: 'Attendance Rate', value: data.attendanceRate, trend: 'Today\'s average', color: '#ec4899', icon: <Clock /> },
                ]);
            }
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    return (
        <div>
            <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Here's what's happening in your workspace today.</p>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {stats.map((s, i) => <StatCard key={i} {...s} />)}
            </div>

            {/* Role Info Card & Circulars Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <h3 style={{ fontWeight: '700', fontSize: '1.05rem', marginBottom: '0.5rem' }}>Your Dashboard View</h3>
                    <p style={{ opacity: 0.85, fontSize: '0.875rem', lineHeight: '1.6' }}>
                        You are currently viewing the <strong>{role}</strong> control panel.
                        All modules relevant to your role have been loaded on the sidebar.
                    </p>
                </div>

                <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.2rem' }}>
                        <Bell size={18} color="var(--primary)" />
                        <h3 style={{ fontWeight: '700', fontSize: '1.1rem' }}>Latest Circulars</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {circulars.length === 0 ? (
                            <p style={{ fontSize: '0.875rem', color: '#94a3b8', textAlign: 'center', padding: '1rem' }}>No recent announcements.</p>
                        ) : (
                            circulars.map(c => (
                                <div key={c.id} style={{ padding: '0.8rem', borderRadius: '0.5rem', background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.3rem' }}>
                                        <h4 style={{ fontWeight: '700', fontSize: '0.9rem', color: '#1e293b' }}>{c.title}</h4>
                                        <span style={{ 
                                            fontSize: '0.65rem', 
                                            padding: '0.1rem 0.4rem', 
                                            borderRadius: '1rem', 
                                            background: c.type === 'Holiday' ? '#fef2f2' : (c.type === 'Event' ? '#f0fdf4' : '#eff6ff'),
                                            color: c.type === 'Holiday' ? '#ef4444' : (c.type === 'Event' ? '#22c55e' : '#3b82f6'),
                                            fontWeight: '700'
                                        }}>
                                            {c.type}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '0.4rem' }}>{c.content}</p>
                                    <p style={{ fontSize: '0.7rem', color: '#94a3b8' }}>📅 {c.date}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Overview;
