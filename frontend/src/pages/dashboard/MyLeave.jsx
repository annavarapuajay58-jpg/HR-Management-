import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';
import api from '../../api';

const statusStyle = {
    Approved: { color: '#22c55e', bg: '#f0fdf4', icon: <CheckCircle2 size={15} color="#22c55e" /> },
    Pending: { color: '#f59e0b', bg: '#fffbeb', icon: <Clock size={15} color="#f59e0b" /> },
    Rejected: { color: '#ef4444', bg: '#fef2f2', icon: <XCircle size={15} color="#ef4444" /> },
};

const typeColors = {
    'Annual Leave': '#6366f1',
    'Sick Leave': '#f59e0b',
    'Casual Leave': '#22c55e',
};

const MyLeave = () => {
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ type: 'Sick Leave', from: '', to: '', reason: '' });
    const [history, setHistory] = useState([]);
    const [balances, setBalances] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState(null); // { type: 'success'|'error', text }

    // Load employee's data on mount
    useEffect(() => {
        fetchMyLeaves();
        fetchBalances();
    }, []);

    const fetchMyLeaves = async () => {
        try {
            setLoading(true);
            const res = await api.get('/leaves/my');
            setHistory(res.data);
        } catch (err) {
            console.error('Failed to load leave history:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchBalances = async () => {
        try {
            const res = await api.get('/leaves/balance');
            setBalances(res.data);
        } catch (err) {
            console.error('Failed to load leave balances:', err);
        }
    };

    const handleSubmit = async () => {
        if (!form.from || !form.to || !form.reason.trim()) {
            setMessage({ type: 'error', text: 'Please fill in all fields.' });
            return;
        }
        try {
            setSubmitting(true);
            setMessage(null);
            await api.post('/leaves', {
                leaveType: form.type,
                fromDate: form.from,
                toDate: form.to,
                reason: form.reason
            });
            setMessage({ type: 'success', text: '✅ Leave request submitted! HR will review it shortly.' });
            setShowForm(false);
            setForm({ type: 'Sick Leave', from: '', to: '', reason: '' });
            fetchMyLeaves(); // refresh the list
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Submission failed.' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div>
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.25rem' }}>My Leave</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Manage your leave requests and balances</p>
                </div>
                <button
                    className="btn btn-primary"
                    style={{ padding: '0.6rem 1.4rem', fontSize: '0.875rem' }}
                    onClick={() => { setShowForm(!showForm); setMessage(null); }}
                >
                    {showForm ? 'Cancel' : '+ Apply for Leave'}
                </button>
            </div>

            {/* Alert message */}
            {message && (
                <div style={{
                    padding: '0.85rem 1.2rem',
                    borderRadius: '0.5rem',
                    marginBottom: '1rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
                    color: message.type === 'success' ? '#16a34a' : '#dc2626',
                    border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`
                }}>
                    {message.text}
                </div>
            )}

            {/* Leave Balance Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {balances.map(lb => {
                    const color = typeColors[lb.type] || '#64748b';
                    return (
                        <div key={lb.type} className="card" style={{ padding: '1.2rem' }}>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500', marginBottom: '0.6rem' }}>{lb.type}</p>
                            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                                <span style={{ fontSize: '1.6rem', fontWeight: '700', color: color }}>{lb.available}</span>
                                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>of {lb.total} days</span>
                            </div>
                            <div style={{ height: '5px', background: '#e2e8f0', borderRadius: '3px' }}>
                                <div style={{ height: '100%', width: `${(lb.used / lb.total) * 100}%`, background: color, borderRadius: '3px', transition: 'width 0.5s' }} />
                            </div>
                            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.4rem' }}>{lb.used} used</p>
                        </div>
                    );
                })}
            </div>

            {/* Apply Form */}
            {showForm && (
                <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem', fontWeight: '600' }}>Apply for Leave</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <div className="input-group">
                            <label>Leave Type</label>
                            <select
                                value={form.type}
                                onChange={e => setForm({ ...form, type: e.target.value })}
                                style={{ width: '100%', padding: '0.65rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '0.9rem' }}
                            >
                                <option>Sick Leave</option>
                                <option>Casual Leave</option>
                                <option>Annual Leave</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>From Date</label>
                            <input type="date" value={form.from} onChange={e => setForm({ ...form, from: e.target.value })} />
                        </div>
                        <div className="input-group">
                            <label>To Date</label>
                            <input type="date" value={form.to} onChange={e => setForm({ ...form, to: e.target.value })} />
                        </div>
                    </div>
                    <div className="input-group" style={{ marginTop: '0.75rem' }}>
                        <label>Reason</label>
                        <textarea
                            value={form.reason}
                            onChange={e => setForm({ ...form, reason: e.target.value })}
                            placeholder="Brief reason for leave..."
                            rows={3}
                            style={{ width: '100%', padding: '0.65rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '0.9rem', resize: 'vertical' }}
                        />
                    </div>
                    <button
                        className="btn btn-primary"
                        style={{ marginTop: '1rem', padding: '0.6rem 1.5rem', fontSize: '0.875rem', opacity: submitting ? 0.7 : 1 }}
                        onClick={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting ? 'Submitting...' : 'Submit Request'}
                    </button>
                </div>
            )}

            {/* Leave History from API */}
            <div className="card">
                <h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Leave History</h3>
                {loading ? (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem' }}>Loading...</p>
                ) : history.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem' }}>No leave requests yet.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {history.map(leave => {
                            const s = statusStyle[leave.status] || statusStyle.Pending;
                            return (
                                <div key={leave._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', background: '#f8fafc', borderRadius: '0.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <Calendar size={18} color="var(--primary)" />
                                        <div>
                                            <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>{leave.leaveType}</p>
                                            <p style={{ color: '#94a3b8', fontSize: '0.78rem' }}>{leave.fromDate} → {leave.toDate} · {leave.days} day(s)</p>
                                            {leave.reason && <p style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '0.15rem' }}>"{leave.reason}"</p>}
                                            {leave.hrComment && <p style={{ color: '#6366f1', fontSize: '0.78rem', marginTop: '0.15rem' }}>HR Note: {leave.hrComment}</p>}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.8rem', borderRadius: '1rem', background: s.bg, color: s.color, fontSize: '0.82rem', fontWeight: '600' }}>
                                        {s.icon} {leave.status}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyLeave;
