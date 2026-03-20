import React, { useState, useEffect } from 'react';
import { Users, Plus, CheckCircle2, Clock, XCircle, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../../api';

const statusStyle = {
    Accepted: { color: '#22c55e', bg: '#f0fdf4', icon: <CheckCircle2 size={14} color="#22c55e" /> },
    Pending: { color: '#f59e0b', bg: '#fffbeb', icon: <Clock size={14} color="#f59e0b" /> },
    Rejected: { color: '#ef4444', bg: '#fef2f2', icon: <XCircle size={14} color="#ef4444" /> },
};

const MyTeam = () => {
    const [projects, setProjects] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [form, setForm] = useState({ name: '', description: '', deadline: '' });
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState(null);
    const [expandedProject, setExpandedProject] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProjects();
        fetchEmployees();
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const res = await api.get('/team/projects');
            setProjects(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            const res = await api.get('/team/employees');
            setEmployees(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const toggleEmployee = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleCreate = async () => {
        if (!form.name || !form.description || selectedIds.length === 0) {
            setMessage({ type: 'error', text: 'Please fill all fields and select at least one employee.' });
            return;
        }
        try {
            setSubmitting(true);
            setMessage(null);
            await api.post('/team/projects', { ...form, employeeIds: selectedIds });
            setMessage({ type: 'success', text: `✅ Project "${form.name}" created and invitations sent!` });
            setShowModal(false);
            setForm({ name: '', description: '', deadline: '' });
            setSelectedIds([]);
            fetchProjects();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to create project.' });
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusCount = (project, status) =>
        project.TeamInvitations?.filter(i => i.status === status).length || 0;

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.25rem' }}>My Team</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Create projects and manage your team members</p>
                </div>
                <button className="btn btn-primary" style={{ padding: '0.6rem 1.4rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    onClick={() => { setShowModal(true); setMessage(null); }}>
                    <Plus size={16} /> Create Project
                </button>
            </div>

            {/* Alert */}
            {message && (
                <div style={{
                    padding: '0.85rem 1.2rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem', fontWeight: '500',
                    background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
                    color: message.type === 'success' ? '#16a34a' : '#dc2626',
                    border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`
                }}>
                    {message.text}
                    <button onClick={() => setMessage(null)} style={{ marginLeft: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: '600' }}>✕</button>
                </div>
            )}

            {/* Projects List */}
            {loading ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading projects...</div>
            ) : projects.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🚀</div>
                    <h3 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>No projects yet</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Click "Create Project" to get started.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {projects.map(project => (
                        <div key={project._id} className="card" style={{ padding: '1.5rem' }}>
                            {/* Project Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                                        <h3 style={{ fontWeight: '700', fontSize: '1.05rem' }}>{project.name}</h3>
                                        <span style={{
                                            fontSize: '0.75rem', padding: '0.2rem 0.65rem', borderRadius: '1rem',
                                            background: project.status === 'Active' ? '#f0fdf4' : '#f8fafc',
                                            color: project.status === 'Active' ? '#22c55e' : '#64748b', fontWeight: '600'
                                        }}>
                                            {project.status}
                                        </span>
                                    </div>
                                    <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{project.description}</p>
                                    {project.deadline && <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>📅 Deadline: {project.deadline}</p>}
                                </div>
                                {/* Member counts */}
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    {['Accepted', 'Pending', 'Rejected'].map(s => (
                                        <div key={s} style={{ textAlign: 'center', padding: '0.4rem 0.75rem', borderRadius: '0.5rem', background: statusStyle[s].bg }}>
                                            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: statusStyle[s].color }}>{getStatusCount(project, s)}</div>
                                            <div style={{ fontSize: '0.7rem', color: statusStyle[s].color }}>{s}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Expand toggle */}
                            <button onClick={() => setExpandedProject(expandedProject === project._id ? null : project._id)}
                                style={{
                                    marginTop: '1rem', background: 'none', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.4rem 1rem',
                                    display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', color: '#64748b', fontSize: '0.85rem'
                                }}>
                                {expandedProject === project.id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                                {expandedProject === project.id ? 'Hide Details' : 'View Members & Ideas'}
                            </button>

                            {expandedProject === project._id && (
                                <div style={{ marginTop: '1rem' }}>
                                    {/* Members */}
                                    <h4 style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.75rem', color: '#475569' }}>👥 Team Members</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                                        {project.TeamInvitations?.length === 0 ? (
                                            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No invitations sent.</p>
                                        ) : project.TeamInvitations?.map(inv => {
                                            const s = statusStyle[inv.status];
                                            return (
                                                <div key={inv._id} style={{
                                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                    padding: '0.6rem 1rem', background: '#f8fafc', borderRadius: '0.5rem'
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                                        <div style={{
                                                            width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#a855f7)',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.75rem', fontWeight: '700'
                                                        }}>
                                                            {inv.employeeName?.charAt(0)?.toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p style={{ fontWeight: '600', fontSize: '0.875rem' }}>{inv.employeeName}</p>
                                                            <p style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{inv.employeeEmail}</p>
                                                        </div>
                                                    </div>
                                                    <span style={{
                                                        display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.2rem 0.65rem', borderRadius: '1rem',
                                                        background: s.bg, color: s.color, fontSize: '0.78rem', fontWeight: '600'
                                                    }}>
                                                        {s.icon} {inv.status}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Ideas */}
                                    <h4 style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.75rem', color: '#475569' }}>
                                        <Lightbulb size={14} style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} />
                                        Ideas from Team
                                    </h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {project.ProjectIdeas?.length === 0 ? (
                                            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No ideas submitted yet.</p>
                                        ) : project.ProjectIdeas?.map(idea => (
                                            <div key={idea._id} style={{ padding: '0.75rem 1rem', background: '#fefce8', borderRadius: '0.5rem', borderLeft: '3px solid #fbbf24' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                                                    <span style={{ fontWeight: '600', fontSize: '0.82rem', color: '#92400e' }}>{idea.authorName}</span>
                                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(idea.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <p style={{ fontSize: '0.875rem', color: '#475569' }}>{idea.idea}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Create Project Modal */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                    <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.25)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontWeight: '700', fontSize: '1.15rem' }}>🚀 Create New Project</h3>
                            <button onClick={() => { setShowModal(false); setMessage(null); }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#94a3b8' }}>✕</button>
                        </div>

                        {message && (
                            <div style={{
                                padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem',
                                background: message.type === 'error' ? '#fef2f2' : '#f0fdf4',
                                color: message.type === 'error' ? '#dc2626' : '#16a34a',
                                border: `1px solid ${message.type === 'error' ? '#fecaca' : '#bbf7d0'}`
                            }}>
                                {message.text}
                            </div>
                        )}

                        {/* Project Details */}
                        <div className="input-group">
                            <label>Project Name *</label>
                            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Q2 Product Launch" />
                        </div>
                        <div className="input-group">
                            <label>Description *</label>
                            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                                placeholder="Describe the project goals and scope..."
                                rows={3} style={{ width: '100%', padding: '0.65rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '0.9rem', resize: 'vertical' }} />
                        </div>
                        <div className="input-group">
                            <label>Deadline</label>
                            <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
                        </div>

                        {/* Employee Selection */}
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', fontWeight: '500', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                Select Team Members * <span style={{ color: '#94a3b8', fontWeight: '400' }}>({selectedIds.length} selected)</span>
                            </label>
                            <div style={{ maxHeight: '220px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.5rem' }}>
                                {employees.length === 0 ? (
                                    <p style={{ color: '#94a3b8', textAlign: 'center', padding: '1rem', fontSize: '0.875rem' }}>No employees found.</p>
                                ) : employees.map(emp => {
                                    const employeeId = emp._id || emp.id;
                                    return (
                                    <label key={employeeId} style={{
                                        display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem',
                                        borderRadius: '0.4rem', cursor: 'pointer', transition: 'background 0.15s',
                                        background: selectedIds.includes(employeeId) ? '#eef2ff' : 'transparent'
                                    }}
                                        onMouseEnter={e => { if (!selectedIds.includes(employeeId)) e.currentTarget.style.background = '#f8fafc'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = selectedIds.includes(employeeId) ? '#eef2ff' : 'transparent'; }}>
                                        <input type="checkbox" checked={selectedIds.includes(employeeId)} onChange={() => toggleEmployee(employeeId)}
                                            style={{ width: '16px', height: '16px', accentColor: '#6366f1', cursor: 'pointer' }} />
                                        <div style={{
                                            width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#a855f7)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '0.8rem', flexShrink: 0
                                        }}>
                                            {emp.name?.charAt(0)?.toUpperCase()}
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: '600', fontSize: '0.875rem' }}>{emp.name}</p>
                                            <p style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{emp.email} · {emp.designation}</p>
                                        </div>
                                    </label>
                                )})}
                            </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button className="btn btn-primary" onClick={handleCreate} disabled={submitting}
                                style={{ flex: 1, opacity: submitting ? 0.7 : 1 }}>
                                {submitting ? 'Creating...' : '📨 Create & Send Invitations'}
                            </button>
                            <button onClick={() => { setShowModal(false); setMessage(null); }}
                                style={{ padding: '0.75rem 1.25rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: '600', color: '#64748b' }}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyTeam;
