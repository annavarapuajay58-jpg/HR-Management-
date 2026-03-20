import React, { useState, useEffect } from 'react';
import { CheckSquare, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

import api from '../../api';

const priorityColors = {
    High: { bg: '#fef2f2', color: '#ef4444', border: '#fecaca' },
    Medium: { bg: '#fffbeb', color: '#f59e0b', border: '#fde68a' },
    Low: { bg: '#f0fdf4', color: '#22c55e', border: '#bbf7d0' },
};

const statusIcon = {
    Completed: <CheckCircle2 size={16} color="#22c55e" />,
    'In Progress': <Clock size={16} color="#6366f1" />,
    Pending: <AlertCircle size={16} color="#f59e0b" />,
};

const MyTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    
    const fetchTasks = async () => {
        try {
            setLoading(true);
            const res = await api.get('/tasks/my');
            setTasks(res.data);
        } catch (err) {
            console.error('Error fetching tasks:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            await api.patch(`/tasks/${taskId}`, { status: newStatus });
            // Update local state
            setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
        } catch (err) {
            console.error('Error updating task status:', err);
            alert('Failed to update task status.');
        }
    };

    const filters = ['All', 'Pending', 'In Progress', 'Completed'];
    const filtered = filter === 'All' ? tasks : tasks.filter(t => t.status === filter);

    return (
        <div>
            <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.25rem' }}>My Tasks</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Track and manage your assigned tasks</p>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {filters.map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        style={{
                            padding: '0.4rem 1rem',
                            borderRadius: '2rem',
                            border: '1.5px solid',
                            borderColor: filter === f ? 'var(--primary)' : '#e2e8f0',
                            background: filter === f ? 'var(--primary)' : 'white',
                            color: filter === f ? 'white' : '#64748b',
                            fontWeight: filter === f ? '600' : '400',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            transition: 'all 0.2s',
                        }}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Tasks List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filtered.map(task => {
                    const p = priorityColors[task.priority];
                    return (
                        <div
                            key={task._id}
                            className="card task-card-hover"
                            style={{ padding: '1.2rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                                <CheckSquare size={20} color="var(--primary)" />
                                <div>
                                    <p style={{ fontWeight: '600', fontSize: '0.95rem', marginBottom: '0.2rem' }}>{task.title}</p>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{task.project}</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '0.78rem', padding: '0.25rem 0.75rem', borderRadius: '1rem', background: p.bg, color: p.color, border: `1px solid ${p.border}`, fontWeight: '600' }}>
                                    {task.priority}
                                </span>
                                
                                <select 
                                    value={task.status}
                                    onChange={(e) => handleStatusChange(task._id, e.target.value)}
                                    style={{ 
                                        fontSize: '0.82rem', 
                                        padding: '0.2rem 0.5rem', 
                                        borderRadius: '0.5rem', 
                                        border: '1px solid #e2e8f0',
                                        outline: 'none',
                                        cursor: 'pointer',
                                        color: '#64748b',
                                        fontWeight: '500'
                                    }}
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                </select>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', color: '#94a3b8' }}>
                                    <Clock size={14} />
                                    Due: {task.due}
                                </div>
                            </div>
                        </div>
                    );
                })}
                {filtered.length === 0 && (
                    <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        No tasks found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyTasks;
