import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Clock, Calendar, User, MessageSquare } from 'lucide-react';
import api from '../../api';

const statusStyle = {
    Approved: { color: '#22c55e', bg: '#f0fdf4', icon: <CheckCircle2 size={15} color="#22c55e" /> },
    Pending: { color: '#f59e0b', bg: '#fffbeb', icon: <Clock size={15} color="#f59e0b" /> },
    Rejected: { color: '#ef4444', bg: '#fef2f2', icon: <XCircle size={15} color="#ef4444" /> },
};

const LeaveRequests = () => {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [actionModal, setActionModal] = useState(null); // { leave, action: 'Approved'|'Rejected' }
    const [hrComment, setHrComment] = useState('');
    const [processing, setProcessing] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchLeaves();
    }, []);

    const fetchLeaves = async () => {
        try {
            setLoading(true);
            const res = await api.get('/leaves/all');
            setLeaves(res.data);
        } catch (err) {
            console.error('Error fetching leaves:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async () => {
        if (!actionModal) return;
        try {
            setProcessing(true);
            await api.patch(`/leaves/${actionModal.leave._id}/status`, {
                status: actionModal.action,
                hrComment
            });
            setMessage({ type: 'success', text: `Leave request ${actionModal.action.toLowerCase()} successfully.` });
            setActionModal(null);
            setHrComment('');
            fetchLeaves();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Action failed.' });
        } finally {
            setProcessing(false);
        }
    };

    const filtered = filter === 'All' ? leaves : leaves.filter(l => l.status === filter);

    const counts = {
        All: leaves.length,
        Pending: leaves.filter(l => l.status === 'Pending').length,
        Approved: leaves.filter(l => l.status === 'Approved').length,
        Rejected: leaves.filter(l => l.status === 'Rejected').length,
    };

    return (
        <div style={{ position: 'relative' }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.25rem' }}>Leave Requests</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Review and manage employee leave applications</p>
            </div>

            {/* Alert */}
            {message && (
                <div style={{
                    padding: '0.85rem 1.2rem', borderRadius: '0.5rem', marginBottom: '1rem',
                    fontSize: '0.875rem', fontWeight: '500',
                    background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
                    color: message.type === 'success' ? '#16a34a' : '#dc2626',
                    border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`
                }}>
                    {message.text}
                    <button onClick={() => setMessage(null)} style={{ marginLeft: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: '600' }}>✕</button>
                </div>
            )}

            {/* Summary Badges */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {['All', 'Pending', 'Approved', 'Rejected'].map(f => (
                    <button key={f} onClick={() => setFilter(f)} style={{
                        padding: '0.4rem 1rem', borderRadius: '2rem', border: '1.5px solid',
                        borderColor: filter === f ? 'var(--primary)' : '#e2e8f0',
                        background: filter === f ? 'var(--primary)' : 'white',
                        color: filter === f ? 'white' : '#64748b',
                        fontWeight: filter === f ? '600' : '400',
                        cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s',
                        display: 'flex', alignItems: 'center', gap: '0.4rem'
                    }}>
                        {f}
                        <span style={{
                            background: filter === f ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                            color: filter === f ? 'white' : '#64748b',
                            padding: '0.1rem 0.5rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: '700'
                        }}>
                            {counts[f]}
                        </span>
                    </button>
                ))}
            </div>

            {/* Leave Cards */}
            {loading ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    Loading leave requests...
                </div>
            ) : filtered.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📋</div>
                    No {filter !== 'All' ? filter.toLowerCase() : ''} leave requests.
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {filtered.map(leave => {
                        const s = statusStyle[leave.status] || statusStyle.Pending;
                        return (
                            <div key={leave._id} className="card" style={{ padding: '1.25rem 1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                                    {/* Employee info */}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '0.8rem' }}>
                                                {leave.employeeName?.charAt(0)?.toUpperCase() || '?'}
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: '700', fontSize: '0.95rem' }}>{leave.employeeName}</p>
                                                <p style={{ color: '#94a3b8', fontSize: '0.78rem' }}>{leave.employeeEmail}</p>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '0.6rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#64748b' }}>
                                                <Calendar size={15} color="#6366f1" />
                                                <strong>{leave.leaveType}</strong>
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                                📅 {leave.fromDate} → {leave.toDate} <span style={{ fontWeight: '600' }}>({leave.days} day{leave.days > 1 ? 's' : ''})</span>
                                            </div>
                                        </div>

                                        <div style={{ marginTop: '0.6rem', padding: '0.5rem 0.75rem', background: '#f8fafc', borderRadius: '0.4rem', fontSize: '0.85rem', color: '#475569' }}>
                                            <MessageSquare size={13} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />
                                            {leave.reason}
                                        </div>

                                        {leave.hrComment && (
                                            <div style={{ marginTop: '0.4rem', fontSize: '0.8rem', color: '#6366f1', fontStyle: 'italic' }}>
                                                HR Note: {leave.hrComment}
                                            </div>
                                        )}
                                    </div>

                                    {/* Status + Actions */}
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.9rem', borderRadius: '1rem', background: s.bg, color: s.color, fontSize: '0.82rem', fontWeight: '600' }}>
                                            {s.icon} {leave.status}
                                        </div>
                                        {leave.status === 'Pending' && (
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    onClick={() => { setActionModal({ leave, action: 'Approved' }); setHrComment(''); setMessage(null); }}
                                                    style={{ padding: '0.4rem 1rem', borderRadius: '0.4rem', border: 'none', background: '#22c55e', color: 'white', fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer', transition: 'opacity 0.2s' }}
                                                    onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                                                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                                                >
                                                    ✓ Approve
                                                </button>
                                                <button
                                                    onClick={() => { setActionModal({ leave, action: 'Rejected' }); setHrComment(''); setMessage(null); }}
                                                    style={{ padding: '0.4rem 1rem', borderRadius: '0.4rem', border: 'none', background: '#ef4444', color: 'white', fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer', transition: 'opacity 0.2s' }}
                                                    onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                                                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                                                >
                                                    ✕ Reject
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Confirm Modal */}
            {actionModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', width: '100%', maxWidth: '440px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
                        <h3 style={{ fontWeight: '700', marginBottom: '0.5rem', fontSize: '1.1rem' }}>
                            {actionModal.action === 'Approved' ? '✅ Approve' : '❌ Reject'} Leave Request
                        </h3>
                        <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>
                            <strong>{actionModal.leave.employeeName}</strong> — {actionModal.leave.leaveType} ({actionModal.leave.days} day{actionModal.leave.days > 1 ? 's' : ''})
                        </p>
                        <div className="input-group">
                            <label>Comment for Employee (optional)</label>
                            <textarea
                                value={hrComment}
                                onChange={e => setHrComment(e.target.value)}
                                placeholder={`Reason for ${actionModal.action.toLowerCase()}...`}
                                rows={3}
                                style={{ width: '100%', padding: '0.65rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '0.9rem', resize: 'vertical' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                            <button
                                onClick={handleAction}
                                disabled={processing}
                                style={{
                                    flex: 1, padding: '0.7rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem',
                                    background: actionModal.action === 'Approved' ? '#22c55e' : '#ef4444',
                                    color: 'white', opacity: processing ? 0.7 : 1
                                }}
                            >
                                {processing ? 'Processing...' : `Confirm ${actionModal.action}`}
                            </button>
                            <button
                                onClick={() => { setActionModal(null); setHrComment(''); }}
                                style={{ padding: '0.7rem 1.2rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', color: '#64748b' }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeaveRequests;
