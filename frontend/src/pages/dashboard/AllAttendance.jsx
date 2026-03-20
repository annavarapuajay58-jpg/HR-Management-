import React, { useState, useEffect } from 'react';
import { Clock, User as UserIcon, Calendar, Search, ArrowLeft, ChevronRight } from 'lucide-react';
import api from '../../api';

const AllAttendance = () => {
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDate, setSelectedDate] = useState(null);

    const fetchAllAttendance = async () => {
        try {
            setLoading(true);
            const res = await api.get('/attendance/all');
            setAttendance(res.data);
        } catch (err) {
            console.error('Error fetching all attendance:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllAttendance();
    }, []);

    // Helper to format date for comparison and display
    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-GB'); // DD/MM/YYYY
    };

    const groupedData = attendance.reduce((acc, record) => {
        const dateKey = formatDate(record.date);
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(record);
        return acc;
    }, {});

    const dates = Object.keys(groupedData).sort((a, b) => {
        const [da, ma, ya] = a.split('/').map(Number);
        const [db, mb, yb] = b.split('/').map(Number);
        return new Date(yb, mb - 1, db) - new Date(ya, ma - 1, ya); // Sort descending
    });

    const filteredDates = dates.filter(date => {
        const normalizedSearch = searchTerm.trim().toLowerCase();
        if (!normalizedSearch) return true;
        
        // Search by date string (DD/MM/YYYY)
        if (date.includes(normalizedSearch)) return true;
        
        // Also search in employee emails for those dates
        return groupedData[date].some(record => 
            record.User?.email?.toLowerCase().includes(normalizedSearch)
        );
    });

    const handleDateClick = (date) => {
        setSelectedDate(date);
    };

    if (selectedDate) {
        const records = groupedData[selectedDate];
        return (
            <div>
                <button 
                    onClick={() => setSelectedDate(null)}
                    style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: '600' }}
                >
                    <ArrowLeft size={18} /> Back to Date List
                </button>

                <div style={{ marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.25rem' }}>Attendance for {selectedDate}</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Showing {records.length} employee records</p>
                </div>

                <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                                    {['Employee', 'Check In', 'Check Out', 'Hours', 'Status'].map(h => (
                                        <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#64748b', fontWeight: '600' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {records.map((row) => (
                                    <tr key={row._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '0.85rem 1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#6366f1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>
                                                    <UserIcon size={12} />
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontWeight: '600' }}>
                                                        {row.User?.firstName && row.User?.lastName 
                                                            ? `${row.User.firstName} ${row.User.lastName}` 
                                                            : (row.User?.email || 'Unknown')}
                                                    </span>
                                                    {row.User?.firstName && (
                                                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{row.User.email}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '0.85rem 1rem' }}>
                                            {row.checkIn ? new Date(row.checkIn).toLocaleTimeString() : '-'}
                                        </td>
                                        <td style={{ padding: '0.85rem 1rem', color: '#64748b' }}>
                                            {row.checkOut ? new Date(row.checkOut).toLocaleTimeString() : '-'}
                                        </td>
                                        <td style={{ padding: '0.85rem 1rem', fontWeight: '600' }}>{row.hoursWorked ? `${row.hoursWorked}h` : '-'}</td>
                                        <td style={{ padding: '0.85rem 1rem' }}>
                                            <span style={{ padding: '0.2rem 0.6rem', borderRadius: '1rem', background: '#f0fdf4', color: '#22c55e', fontSize: '0.75rem', fontWeight: '700' }}>
                                                {row.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.25rem' }}>Attendance History</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Grouped by date • Search by DD/MM/YYYY</p>
                </div>
                <div style={{ position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input 
                        type="text" 
                        placeholder="Search date (15/03/2026)..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ padding: '0.5rem 1rem 0.5rem 2.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', width: '250px' }}
                    />
                </div>
            </div>

            <div className="card" style={{ padding: '1.5rem' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Loading dates...</div>
                ) : (
                    <div>
                        {filteredDates.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No records found for that search.</div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                                {filteredDates.map(date => (
                                    <div 
                                        key={date} 
                                        onClick={() => handleDateClick(date)}
                                        className="card stat-card-hover"
                                        style={{ 
                                            padding: '1.25rem', 
                                            cursor: 'pointer', 
                                            border: '1px solid #e2e8f0',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>
                                                <Calendar size={20} />
                                            </div>
                                            <div>
                                                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>{date}</h3>
                                                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                                                    {groupedData[date].length} Employees present
                                                </p>
                                            </div>
                                        </div>
                                        <ChevronRight size={20} style={{ color: '#94a3b8' }} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllAttendance;
