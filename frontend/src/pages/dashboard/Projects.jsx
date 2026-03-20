import React, { useState, useEffect } from 'react';
import api from '../../api';
import {
    Briefcase, Users, Calendar, RefreshCw, Search,
    CheckCircle2, Clock, PauseCircle, ChevronDown, ChevronUp, Lightbulb
} from 'lucide-react';

const statusConfig = {
    Active:    { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', icon: <CheckCircle2 size={13} />, dot: '#22c55e' },
    Completed: { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', icon: <CheckCircle2 size={13} />, dot: '#3b82f6' },
    'On Hold': { color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: <PauseCircle size={13} />,  dot: '#f59e0b' },
};

const inviteStatusColor = {
    Accepted: '#16a34a',
    Pending:  '#d97706',
    Rejected: '#ef4444',
};

const StatusBadge = ({ status }) => {
    const cfg = statusConfig[status] || statusConfig['Active'];
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
            fontSize: '0.72rem', fontWeight: '700', padding: '0.2rem 0.65rem',
            borderRadius: '999px', background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
            textTransform: 'uppercase', letterSpacing: '0.04em'
        }}>
            {cfg.icon} {status}
        </span>
    );
};

const Projects = () => {
    const [projects, setProjects]     = useState([]);
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState('');
    const [search, setSearch]         = useState('');
    const [statusFilter, setStatus]   = useState('All');
    const [expanded, setExpanded]     = useState({});

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isHRorAdmin = user.role === 'HR' || user.role === 'Admin';

    const fetchProjects = async () => {
        setLoading(true);
        setError('');
        try {
            // HR/Admin see all projects; Teamlead sees only their own
            const endpoint = isHRorAdmin ? '/team/all-projects' : '/team/projects';
            const res = await api.get(endpoint);
            setProjects(res.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load projects.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProjects(); }, []);


    const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

    const filtered = projects.filter(p => {
        const q = search.toLowerCase();
        const matchSearch = p.name?.toLowerCase().includes(q) || p.teamLeadName?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q);
        const matchStatus = statusFilter === 'All' || p.status === statusFilter;
        return matchSearch && matchStatus;
    });

    // Stats
    const total     = projects.length;
    const active    = projects.filter(p => p.status === 'Active').length;
    const completed = projects.filter(p => p.status === 'Completed').length;
    const onHold    = projects.filter(p => p.status === 'On Hold').length;

    return (
        <div>
            {/* Page Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.25rem' }}>All Projects</h2>
                    <p style={{ color: '#64748b', fontSize: '0.875rem' }}>{total} total project{total !== 1 ? 's' : ''} across all teams</p>
                </div>
                <button onClick={fetchProjects} style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.5rem 1rem', borderRadius: '0.5rem',
                    border: '1.5px solid #e2e8f0', background: 'white',
                    color: '#475569', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer'
                }}>
                    <RefreshCw size={15} /> Refresh
                </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Total',     value: total,     color: '#6366f1', bg: '#eef2ff', icon: <Briefcase size={19} /> },
                    { label: 'Active',    value: active,    color: '#16a34a', bg: '#f0fdf4', icon: <CheckCircle2 size={19} /> },
                    { label: 'Completed', value: completed, color: '#2563eb', bg: '#eff6ff', icon: <CheckCircle2 size={19} /> },
                    { label: 'On Hold',   value: onHold,    color: '#d97706', bg: '#fffbeb', icon: <PauseCircle size={19} /> },
                ].map((s, i) => (
                    <div key={i} style={{
                        background: 'white', borderRadius: '0.75rem', padding: '1rem 1.25rem',
                        border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.75rem',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '0.5rem', background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {s.icon}
                        </div>
                        <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b', lineHeight: 1 }}>{s.value}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search + Filter */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                    <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                        type="text"
                        placeholder="Search projects, team leads..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{
                            width: '100%', padding: '0.6rem 0.75rem 0.6rem 2.25rem',
                            borderRadius: '0.5rem', border: '1.5px solid #e2e8f0',
                            fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box'
                        }}
                        onFocus={e => e.target.style.borderColor = '#6366f1'}
                        onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                    />
                </div>
                <select value={statusFilter} onChange={e => setStatus(e.target.value)} style={{
                    padding: '0.6rem 1rem', borderRadius: '0.5rem', border: '1.5px solid #e2e8f0',
                    fontSize: '0.875rem', background: 'white', cursor: 'pointer', color: '#475569', fontWeight: '500', outline: 'none'
                }}>
                    <option value="All">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                </select>
            </div>

            {/* Content */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', flexDirection: 'column', gap: '0.75rem', color: '#94a3b8' }}>
                    <div style={{ width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    <span style={{ fontSize: '0.875rem' }}>Loading projects...</span>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            ) : error ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#ef4444', background: '#fef2f2', borderRadius: '0.75rem', border: '1px solid #fecaca' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚠️</div>
                    <p style={{ fontWeight: '600' }}>{error}</p>
                </div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b', background: '#f8fafc', borderRadius: '0.75rem', border: '1px dashed #e2e8f0' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📂</div>
                    <p style={{ fontWeight: '600', fontSize: '1rem', color: '#475569' }}>
                        {projects.length === 0 ? 'No projects created yet.' : 'No projects match your search.'}
                    </p>
                    <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                        {projects.length === 0 ? 'Team Leads can create projects from their dashboard.' : 'Try adjusting your search or filter.'}
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {filtered.map(project => {
                        const isExpanded = expanded[project._id];
                        const members    = project.TeamInvitations || [];
                        const ideas      = project.ProjectIdeas || [];
                        const accepted   = members.filter(m => m.status === 'Accepted').length;

                        return (
                            <div key={project._id} style={{
                                background: 'white', borderRadius: '0.75rem',
                                border: '1px solid #e2e8f0', overflow: 'hidden',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                            }}>
                                {/* Project Row */}
                                <div style={{
                                    padding: '1.25rem 1.5rem', display: 'flex',
                                    alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap',
                                    borderLeft: `4px solid ${statusConfig[project.status]?.dot || '#6366f1'}`
                                }}>
                                    {/* Icon */}
                                    <div style={{
                                        width: '44px', height: '44px', borderRadius: '0.6rem',
                                        background: '#eef2ff', color: '#6366f1', flexShrink: 0,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <Briefcase size={20} />
                                    </div>

                                    {/* Info */}
                                    <div style={{ flex: 1, minWidth: '200px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                                            <h3 style={{ fontWeight: '700', fontSize: '1rem', color: '#1e293b' }}>{project.name}</h3>
                                            <StatusBadge status={project.status} />
                                        </div>
                                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.6rem', lineHeight: '1.45' }}>
                                            {project.description}
                                        </p>
                                        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.8rem', color: '#94a3b8' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                <Users size={13} /> <strong style={{ color: '#475569' }}>{project.teamLeadName}</strong>
                                            </span>
                                            {project.deadline && (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                    <Calendar size={13} /> {project.deadline}
                                                </span>
                                            )}
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                <Users size={13} /> {accepted}/{members.length} members
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                <Lightbulb size={13} /> {ideas.length} idea{ideas.length !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Expand button */}
                                    <button onClick={() => toggleExpand(project._id)} style={{
                                        background: '#f8fafc', border: '1px solid #e2e8f0',
                                        borderRadius: '0.5rem', padding: '0.4rem 0.75rem',
                                        cursor: 'pointer', color: '#64748b', fontWeight: '600',
                                        fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem',
                                        flexShrink: 0
                                    }}>
                                        {isExpanded ? <><ChevronUp size={14} /> Less</> : <><ChevronDown size={14} /> Details</>}
                                    </button>
                                </div>

                                {/* Expanded Details */}
                                {isExpanded && (
                                    <div style={{ borderTop: '1px solid #f1f5f9', padding: '1.25rem 1.5rem', background: '#fafafe' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: members.length > 0 ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>

                                            {/* Members */}
                                            {members.length > 0 && (
                                                <div>
                                                    <h4 style={{ fontWeight: '700', fontSize: '0.85rem', color: '#475569', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                        Team Members ({members.length})
                                                    </h4>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                                        {members.map(m => (
                                                            <div key={m._id} style={{
                                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                                padding: '0.5rem 0.75rem', background: 'white', borderRadius: '0.5rem',
                                                                border: '1px solid #e2e8f0', fontSize: '0.85rem'
                                                            }}>
                                                                <span style={{ fontWeight: '600', color: '#1e293b' }}>{m.employeeName}</span>
                                                                <span style={{
                                                                    fontSize: '0.72rem', fontWeight: '700', padding: '0.15rem 0.5rem',
                                                                    borderRadius: '999px', color: inviteStatusColor[m.status] || '#64748b',
                                                                    background: m.status === 'Accepted' ? '#f0fdf4' : m.status === 'Pending' ? '#fffbeb' : '#fef2f2',
                                                                    border: `1px solid ${m.status === 'Accepted' ? '#bbf7d0' : m.status === 'Pending' ? '#fde68a' : '#fecaca'}`
                                                                }}>
                                                                    {m.status}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Ideas */}
                                            <div>
                                                <h4 style={{ fontWeight: '700', fontSize: '0.85rem', color: '#475569', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                    Ideas ({ideas.length})
                                                </h4>
                                                {ideas.length === 0 ? (
                                                    <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>No ideas posted yet.</p>
                                                ) : (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '200px', overflowY: 'auto' }}>
                                                        {ideas.map(idea => (
                                                            <div key={idea._id} style={{
                                                                padding: '0.65rem 0.85rem', background: '#fefce8',
                                                                borderRadius: '0.5rem', borderLeft: '3px solid #fbbf24'
                                                            }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                                                                    <span style={{ fontWeight: '700', fontSize: '0.78rem', color: '#92400e' }}>{idea.authorName}</span>
                                                                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                                                                        {new Date(idea.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                                                    </span>
                                                                </div>
                                                                <p style={{ fontSize: '0.83rem', color: '#475569', lineHeight: '1.4' }}>{idea.idea}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {!loading && !error && filtered.length > 0 && (
                <p style={{ textAlign: 'right', fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.75rem' }}>
                    Showing {filtered.length} of {projects.length} projects
                </p>
            )}
        </div>
    );
};

export default Projects;
