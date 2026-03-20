import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Clock, Lightbulb, Send, Calendar } from 'lucide-react';
import api from '../../api';

const statusStyle = {
    Accepted: { color: '#22c55e', bg: '#f0fdf4', icon: <CheckCircle2 size={14} color="#22c55e" /> },
    Pending: { color: '#f59e0b', bg: '#fffbeb', icon: <Clock size={14} color="#f59e0b" /> },
    Rejected: { color: '#ef4444', bg: '#fef2f2', icon: <XCircle size={14} color="#ef4444" /> },
};

const MyProject = () => {
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(null);
    const [ideas, setIdeas] = useState({}); // { projectId: [...ideas] }
    const [ideaText, setIdeaText] = useState({}); // { projectId: currentText }
    const [postingIdea, setPostingIdea] = useState(null);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchInvitations();
    }, []);

    const fetchInvitations = async () => {
        try {
            setLoading(true);
            const res = await api.get('/team/invitations');
            setInvitations(res.data);
            // Auto-load ideas for accepted projects
            res.data.filter(inv => inv.status === 'Accepted').forEach(inv => {
                fetchIdeas(inv.Project._id);
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchIdeas = async (projectId) => {
        try {
            const res = await api.get(`/team/projects/${projectId}/ideas`);
            setIdeas(prev => ({ ...prev, [projectId]: res.data }));
        } catch (err) {
            console.error(err);
        }
    };

    const respond = async (invitationId, status) => {
        try {
            setProcessing(invitationId);
            await api.patch(`/team/invitations/${invitationId}`, { status });
            setMessage({ type: 'success', text: `✅ You have ${status.toLowerCase()} the project invitation.` });
            fetchInvitations();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Action failed.' });
        } finally {
            setProcessing(null);
        }
    };

    const submitIdea = async (projectId) => {
        const text = ideaText[projectId]?.trim();
        if (!text) return;
        try {
            setPostingIdea(projectId);
            await api.post(`/team/projects/${projectId}/ideas`, { idea: text });
            setIdeaText(prev => ({ ...prev, [projectId]: '' }));
            fetchIdeas(projectId);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to post idea.' });
        } finally {
            setPostingIdea(null);
        }
    };

    const pending = invitations.filter(i => i.status === 'Pending');
    const accepted = invitations.filter(i => i.status === 'Accepted');
    const rejected = invitations.filter(i => i.status === 'Rejected');

    return (
        <div>
            <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.25rem' }}>My Project</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>View project invitations, collaborate, and share your ideas</p>
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

            {loading ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading...</div>
            ) : invitations.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📭</div>
                    <h3 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>No invitations yet</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Your Team Lead hasn't invited you to a project yet.</p>
                </div>
            ) : (
                <>
                    {/* ── Pending Invitations ── */}
                    {pending.length > 0 && (
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Clock size={16} color="#f59e0b" /> Pending Invitations ({pending.length})
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {pending.map(inv => (
                                    <div key={inv._id} className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #f59e0b' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                                                    <span style={{ fontSize: '1.1rem' }}>📋</span>
                                                    <h4 style={{ fontWeight: '700', fontSize: '1rem' }}>{inv.Project?.name}</h4>
                                                </div>
                                                <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{inv.Project?.description}</p>
                                                <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.8rem', color: '#94a3b8' }}>
                                                    <span>👤 Team Lead: <strong style={{ color: '#475569' }}>{inv.Project?.teamLeadName}</strong></span>
                                                    {inv.Project?.deadline && <span><Calendar size={12} style={{ verticalAlign: 'middle' }} /> Deadline: {inv.Project.deadline}</span>}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.6rem' }}>
                                                <button onClick={() => respond(inv._id, 'Accepted')} disabled={processing === inv._id}
                                                    style={{
                                                        padding: '0.55rem 1.25rem', borderRadius: '0.5rem', border: 'none', background: '#22c55e', color: 'white',
                                                        fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', opacity: processing === inv.id ? 0.7 : 1, transition: 'opacity 0.2s'
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                                                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                                                    ✓ Accept
                                                </button>
                                                <button onClick={() => respond(inv._id, 'Rejected')} disabled={processing === inv._id}
                                                    style={{
                                                        padding: '0.55rem 1.25rem', borderRadius: '0.5rem', border: 'none', background: '#ef4444', color: 'white',
                                                        fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', opacity: processing === inv.id ? 0.7 : 1, transition: 'opacity 0.2s'
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                                                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                                                    ✕ Reject
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Accepted / Active Projects ── */}
                    {accepted.length > 0 && (
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <CheckCircle2 size={16} color="#22c55e" /> Active Projects ({accepted.length})
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                {accepted.map(inv => {
                                    const project = inv.Project;
                                    const projectIdeas = ideas[project._id] || [];
                                    return (
                                        <div key={inv._id} className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #22c55e' }}>
                                            {/* Project Info */}
                                            <div style={{ marginBottom: '1.25rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                                                    <span style={{ fontSize: '1.1rem' }}>🚀</span>
                                                    <h4 style={{ fontWeight: '700', fontSize: '1.05rem' }}>{project.name}</h4>
                                                    <span style={{
                                                        fontSize: '0.72rem', padding: '0.2rem 0.6rem', borderRadius: '1rem',
                                                        background: '#f0fdf4', color: '#22c55e', fontWeight: '600'
                                                    }}>Active</span>
                                                </div>
                                                <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{project.description}</p>
                                                <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.8rem', color: '#94a3b8' }}>
                                                    <span>👤 Team Lead: <strong style={{ color: '#475569' }}>{project.teamLeadName}</strong></span>
                                                    {project.deadline && <span><Calendar size={12} style={{ verticalAlign: 'middle' }} /> Deadline: {project.deadline}</span>}
                                                </div>
                                            </div>

                                            {/* Ideas Section */}
                                            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                                                <h5 style={{ fontWeight: '600', fontSize: '0.875rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#475569' }}>
                                                    <Lightbulb size={14} color="#f59e0b" /> Team Ideas ({projectIdeas.length})
                                                </h5>

                                                {/* Idea Input */}
                                                <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.75rem' }}>
                                                    <textarea
                                                        value={ideaText[project._id] || ''}
                                                        onChange={e => setIdeaText(prev => ({ ...prev, [project._id]: e.target.value }))}
                                                        placeholder="Share your idea for this project..."
                                                        rows={2}
                                                        style={{ flex: 1, padding: '0.65rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '0.875rem', resize: 'vertical' }}
                                                    />
                                                    <button onClick={() => submitIdea(project._id)} disabled={postingIdea === project._id || !ideaText[project._id]?.trim()}
                                                        style={{
                                                            padding: '0.6rem 1rem', borderRadius: '0.5rem', border: 'none', background: 'var(--primary)', color: 'white',
                                                            cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem',
                                                            opacity: (!ideaText[project._id]?.trim() || postingIdea === project._id) ? 0.6 : 1, alignSelf: 'flex-start'
                                                        }}>
                                                        <Send size={14} />
                                                        {postingIdea === project.id ? 'Posting...' : 'Post'}
                                                    </button>
                                                </div>

                                                {/* Ideas List */}
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '280px', overflowY: 'auto' }}>
                                                    {projectIdeas.length === 0 ? (
                                                        <p style={{ color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center', padding: '0.75rem' }}>
                                                            No ideas yet. Be the first to share! 💡
                                                        </p>
                                                    ) : projectIdeas.map(idea => (
                                                        <div key={idea._id} style={{ padding: '0.75rem 1rem', background: '#fefce8', borderRadius: '0.5rem', borderLeft: '3px solid #fbbf24' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', flexWrap: 'wrap', gap: '0.3rem' }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                                    <span style={{ fontWeight: '700', fontSize: '0.82rem', color: '#92400e' }}>{idea.authorName}</span>
                                                                    <span style={{
                                                                        fontSize: '0.72rem', padding: '0.1rem 0.45rem', borderRadius: '1rem',
                                                                        background: '#fde68a', color: '#92400e'
                                                                    }}>{idea.authorRole}</span>
                                                                </div>
                                                                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                                                    {new Date(idea.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            </div>
                                                            <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: '1.5' }}>{idea.idea}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ── Rejected ── */}
                    {rejected.length > 0 && (
                        <div>
                            <h3 style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.5rem', color: '#94a3b8' }}>Declined Invitations</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {rejected.map(inv => (
                                    <div key={inv._id} style={{ padding: '0.85rem 1rem', background: '#fef2f2', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: '600', fontSize: '0.875rem', color: '#64748b' }}>{inv.Project?.name}</span>
                                        <span style={{ fontSize: '0.78rem', color: '#ef4444', fontWeight: '600' }}>Rejected</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default MyProject;
