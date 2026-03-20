import React, { useState, useEffect } from 'react';
import { Plus, Search, Calendar, Flag, User as UserIcon, CheckCircle2, Clock, AlertCircle, Loader2 } from 'lucide-react';
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

const ManageTasks = () => {
    const [employees, setEmployees] = useState([]);
    const [assignedTasks, setAssignedTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const [form, setForm] = useState({
        title: '',
        priority: 'Medium',
        due: '',
        project: 'General',
        assignedTo: ''
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Fetch employees
            try {
                const empRes = await api.get('/team/employees');
                setEmployees(empRes.data);
            } catch (err) {
                console.error('Fetch employees error:', err);
            }

            // Fetch assigned tasks
            try {
                const taskRes = await api.get('/tasks/assigned-by-me');
                setAssignedTasks(taskRes.data);
            } catch (err) {
                console.error('Fetch tasks error:', err);
                // We keep assignedTasks as empty array if this fails
            }

        } catch (err) {
            console.error('General fetch error:', err);
            setError('Failed to load data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.assignedTo) {
            alert('Please select an employee');
            return;
        }
        setSubmitting(true);
        try {
            await api.post('/tasks', form);
            alert('Task assigned successfully!');
            setShowModal(false);
            setForm({ title: '', priority: 'Medium', due: '', project: 'General', assignedTo: '' });
            fetchData();
        } catch (err) {
            console.error('Submit error:', err);
            const errorMessage = err.response?.data?.error || 'Failed to assign task.';
            alert(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                <Loader2 className="animate-spin" size={48} color="var(--primary)" />
            </div>
        );
    }

    return (
        <div>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Manage Tasks</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Assign and track tasks for your team members</p>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    style={{ 
                        padding: '0.6rem 1.25rem', 
                        background: 'var(--primary)', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '0.5rem', 
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer'
                    }}
                >
                    <Plus size={18} /> Assign New Task
                </button>
            </div>

            <div className="card">
                <div style={{ borderBottom: '1px solid #e2e8f0', padding: '1.25rem 1.5rem', background: '#f8fafc' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Assigned Tasks</h3>
                </div>
                <div style={{ padding: '0' }}>
                    {assignedTasks.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                                        <th style={{ padding: '1rem 1.5rem', color: '#64748b', fontWeight: '600', fontSize: '0.85rem' }}>TASK</th>
                                        <th style={{ padding: '1rem 1.5rem', color: '#64748b', fontWeight: '600', fontSize: '0.85rem' }}>ASSIGNED TO</th>
                                        <th style={{ padding: '1rem 1.5rem', color: '#64748b', fontWeight: '600', fontSize: '0.85rem' }}>DUE DATE</th>
                                        <th style={{ padding: '1rem 1.5rem', color: '#64748b', fontWeight: '600', fontSize: '0.85rem' }}>PRIORITY</th>
                                        <th style={{ padding: '1rem 1.5rem', color: '#64748b', fontWeight: '600', fontSize: '0.85rem' }}>STATUS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assignedTasks.map(task => {
                                        const p = priorityColors[task.priority];
                                        const assignee = task.User?.Employee 
                                            ? `${task.User.Employee.firstName} ${task.User.Employee.lastName}`
                                            : task.User?.email.split('@')[0];
                                        return (
                                            <tr key={task._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                                    <p style={{ fontWeight: '600', color: '#1e293b' }}>{task.title}</p>
                                                    <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{task.project}</p>
                                                </td>
                                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#e0e7ff', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '700' }}>
                                                            {assignee[0].toUpperCase()}
                                                        </div>
                                                        <span style={{ fontSize: '0.9rem', color: '#475569' }}>{assignee}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1.25rem 1.5rem', color: '#64748b', fontSize: '0.9rem' }}>
                                                    {task.due}
                                                </td>
                                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                                    <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '1rem', background: p.bg, color: p.color, border: `1px solid ${p.border}`, fontWeight: '600' }}>
                                                        {task.priority}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', color: '#475569', fontWeight: '500' }}>
                                                        {statusIcon[task.status]}
                                                        {task.status}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                <CheckCircle2 size={30} color="#94a3b8" />
                            </div>
                            <h4 style={{ fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>No tasks assigned yet</h4>
                            <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '300px', margin: '0 auto' }}>You haven't assigned any tasks to your team members. Start by clicking "Assign New Task".</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Assignment Modal */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                    <div style={{ background: 'white', borderRadius: '1rem', width: '100%', maxWidth: '500px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Assign Task</h3>
                            <button onClick={() => setShowModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#475569' }}>Task Title</label>
                                    <input 
                                        type="text" 
                                        name="title"
                                        required
                                        value={form.title}
                                        onChange={handleChange}
                                        placeholder="e.g. Design Landing Page"
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', outline: 'none' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#475569' }}>Assign To</label>
                                    <select 
                                        name="assignedTo"
                                        required
                                        value={form.assignedTo}
                                        onChange={handleChange}
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', outline: 'none' }}
                                    >
                                        <option value="">Select Employee</option>
                                        {employees.map(emp => (
                                            <option key={emp._id} value={emp._id}>
                                                {emp.name} ({emp.designation})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#475569' }}>Priority</label>
                                        <select 
                                            name="priority"
                                            value={form.priority}
                                            onChange={handleChange}
                                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', outline: 'none' }}
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#475569' }}>Due Date</label>
                                        <input 
                                            type="date" 
                                            name="due"
                                            required
                                            value={form.due}
                                            onChange={handleChange}
                                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', outline: 'none' }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#475569' }}>Project (Optional)</label>
                                    <input 
                                        type="text" 
                                        name="project"
                                        value={form.project}
                                        onChange={handleChange}
                                        placeholder="e.g. Website Redesign"
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', outline: 'none' }}
                                    />
                                </div>
                            </div>
                            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                                <button 
                                    type="submit" 
                                    disabled={submitting}
                                    style={{ flex: 1, padding: '0.75rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    {submitting ? <Loader2 className="animate-spin" size={20} /> : 'Assign Task'}
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    style={{ flex: 1, padding: '0.75rem', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '0.5rem', fontWeight: '700', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageTasks;
