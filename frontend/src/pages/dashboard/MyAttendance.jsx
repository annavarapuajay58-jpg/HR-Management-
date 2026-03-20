import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, XCircle, AlertCircle, LogIn, LogOut } from 'lucide-react';
import api from '../../api';

const statusStyle = {
    Present: { color: '#22c55e', bg: '#f0fdf4', icon: <CheckCircle2 size={15} color="#22c55e" /> },
    Absent: { color: '#ef4444', bg: '#fef2f2', icon: <XCircle size={15} color="#ef4444" /> },
    Late: { color: '#f59e0b', bg: '#fffbeb', icon: <AlertCircle size={15} color="#f59e0b" /> },
};

const MyAttendance = () => {
    const [attendanceData, setAttendanceData] = useState([]);
    const [todayStatus, setTodayStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchAttendance = async () => {
        try {
            const [historyRes, todayRes] = await Promise.all([
                api.get('/attendance/my'),
                api.get('/attendance/today')
            ]);
            setAttendanceData(historyRes.data);
            setTodayStatus(todayRes.data._id ? todayRes.data : null);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch attendance:', err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendance();
    }, []);

    const handleCheckIn = async () => {
        try {
            await api.post('/attendance/check-in');
            fetchAttendance();
        } catch (err) {
            alert(err.response?.data?.error || 'Check-in failed');
        }
    };

    const handleCheckOut = async () => {
        try {
            await api.post('/attendance/check-out');
            fetchAttendance();
        } catch (err) {
            alert(err.response?.data?.error || 'Check-out failed');
        }
    };

    const presentDays = attendanceData.filter(d => d.status === 'Present').length;
    const absentDays = attendanceData.filter(d => d.status === 'Absent').length;
    const lateDays = attendanceData.filter(d => d.status === 'Late').length;

    return (
        <div>
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.25rem' }}>My Attendance</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>View your attendance record for this month</p>
                </div>
                <div style={{ display: 'flex', gap: '0.8rem' }}>
                    {!todayStatus ? (
                        <button className="btn btn-primary" onClick={handleCheckIn} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <LogIn size={18} /> Check In
                        </button>
                    ) : !todayStatus.checkOut ? (
                        <button className="btn btn-secondary" onClick={handleCheckOut} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f59e0b', color: 'white', border: 'none' }}>
                            <LogOut size={18} /> Check Out
                        </button>
                    ) : (
                        <span style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', background: '#f0fdf4', color: '#22c55e', fontWeight: '600', fontSize: '0.875rem' }}>
                            Completed for today
                        </span>
                    )}
                </div>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Days Present', value: presentDays, color: '#22c55e', bg: '#f0fdf4' },
                    { label: 'Days Absent', value: absentDays, color: '#ef4444', bg: '#fef2f2' },
                    { label: 'Days Late', value: lateDays, color: '#f59e0b', bg: '#fffbeb' },
                    { label: 'Total Days', value: attendanceData.length, color: '#6366f1', bg: '#eef2ff' },
                ].map(stat => (
                    <div key={stat.label} className="card" style={{ padding: '1.2rem', borderLeft: `4px solid ${stat.color}` }}>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '500', marginBottom: '0.5rem' }}>{stat.label}</p>
                        <p style={{ fontSize: '2rem', fontWeight: '800', color: stat.color }}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Attendance Table */}
            <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Recent Attendance</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                                {['Date', 'Day', 'Check In', 'Check Out', 'Hours Worked', 'Status'].map(h => (
                                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#64748b', fontWeight: '600', whiteSpace: 'nowrap' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {attendanceData.map((row, i) => {
                                const s = statusStyle[row.status] || statusStyle.Present;
                                const checkInTime = row.checkIn ? new Date(row.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-';
                                const checkOutTime = row.checkOut ? new Date(row.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-';
                                return (
                                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '0.85rem 1rem', fontWeight: '500' }}>{row.date}</td>
                                        <td style={{ padding: '0.85rem 1rem', color: '#64748b' }}>{new Date(row.date).toLocaleDateString('en-US', { weekday: 'long' })}</td>
                                        <td style={{ padding: '0.85rem 1rem' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <Clock size={14} color="#6366f1" /> {checkInTime}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.85rem 1rem', color: '#64748b' }}>{checkOutTime}</td>
                                        <td style={{ padding: '0.85rem 1rem', fontWeight: '600', color: !row.hoursWorked ? '#94a3b8' : '#1e293b' }}>{row.hoursWorked ? `${row.hoursWorked}h` : '-'}</td>
                                        <td style={{ padding: '0.85rem 1rem' }}>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.25rem 0.75rem', borderRadius: '1rem', background: s.bg, color: s.color, fontWeight: '600', fontSize: '0.78rem' }}>
                                                {s.icon} {row.status}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MyAttendance;
