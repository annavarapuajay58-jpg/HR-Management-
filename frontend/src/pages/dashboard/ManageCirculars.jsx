import React, { useState, useEffect } from 'react';
import { Send, Trash2, Megaphone, Calendar, Tag } from 'lucide-react';
import api from '../../api';

const ManageCirculars = () => {
    const [circulars, setCirculars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        type: 'Info',
        date: new Date().toISOString().split('T')[0]
    });
    const [isPosting, setIsPosting] = useState(false);

    const fetchCirculars = async () => {
        try {
            setLoading(true);
            const res = await api.get('/circulars');
            setCirculars(res.data);
        } catch (err) {
            console.error('Error fetching circulars:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCirculars();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsPosting(true);
            await api.post('/circulars', formData);
            setFormData({
                title: '',
                content: '',
                type: 'Info',
                date: new Date().toISOString().split('T')[0]
            });
            fetchCirculars();
            alert('Circular posted successfully!');
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to post circular');
        } finally {
            setIsPosting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this circular?')) return;
        try {
            await api.delete(`/circulars/${id}`);
            fetchCirculars();
        } catch (err) {
            alert('Failed to delete circular');
        }
    };

    return (
        <div>
            <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.25rem' }}>Manage Circulars</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Post announcements and events for all employees</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
                {/* Form */}
                <div className="card" style={{ padding: '1.5rem', height: 'fit-content' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.2rem' }}>Post New Circular</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div className="input-group">
                            <label>Title</label>
                            <input 
                                type="text" 
                                name="title" 
                                value={formData.title} 
                                onChange={handleChange} 
                                placeholder="Circular Title" 
                                required 
                            />
                        </div>
                        <div className="input-group">
                            <label>Type</label>
                            <select name="type" value={formData.type} onChange={handleChange}>
                                <option value="Info">General Info</option>
                                <option value="Holiday">Holiday</option>
                                <option value="Event">Event</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Date</label>
                            <input 
                                type="date" 
                                name="date" 
                                value={formData.date} 
                                onChange={handleChange} 
                                required 
                            />
                        </div>
                        <div className="input-group">
                            <label>Content</label>
                            <textarea 
                                name="content" 
                                value={formData.content} 
                                onChange={handleChange} 
                                placeholder="Circular details..." 
                                rows={4} 
                                required
                                style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', resize: 'vertical' }}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={isPosting} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <Send size={18} /> {isPosting ? 'Posting...' : 'Post Circular'}
                        </button>
                    </form>
                </div>

                {/* List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Recent Circulars</h3>
                    {loading ? (
                        <p>Loading...</p>
                    ) : circulars.length === 0 ? (
                        <div className="card" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                            No circulars posted yet.
                        </div>
                    ) : (
                        circulars.map(c => (
                            <div key={c._id} className="card" style={{ padding: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                        <Megaphone size={16} color="var(--primary)" />
                                        <h4 style={{ fontWeight: '700', fontSize: '1rem' }}>{c.title}</h4>
                                        <span style={{ 
                                            fontSize: '0.7rem', 
                                            padding: '0.1rem 0.5rem', 
                                            borderRadius: '1rem', 
                                            background: c.type === 'Holiday' ? '#fef2f2' : (c.type === 'Event' ? '#f0fdf4' : '#eff6ff'),
                                            color: c.type === 'Holiday' ? '#ef4444' : (c.type === 'Event' ? '#22c55e' : '#3b82f6'),
                                            fontWeight: '700',
                                            marginLeft: '0.5rem'
                                        }}>
                                            {c.type}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>
                                        <Calendar size={12} style={{ marginRight: '0.3rem' }} /> {c.date}
                                    </p>
                                    <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.4' }}>{c.content}</p>
                                </div>
                                <button 
                                    onClick={() => handleDelete(c._id)} 
                                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem' }}
                                    title="Delete Circular"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageCirculars;
