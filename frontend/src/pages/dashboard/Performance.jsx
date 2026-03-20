import React, { useState, useEffect } from 'react';
import { Loader2, TrendingUp, Users, Calendar, CheckSquare, Award, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import api from '../../api';

const Performance = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPerformance = async () => {
            try {
                setLoading(true);
                const res = await api.get('/performance');
                setData(res.data);
            } catch (err) {
                console.error('Error fetching performance:', err);
                setError('Failed to load performance data.');
            } finally {
                setLoading(false);
            }
        };
        fetchPerformance();
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
                <Loader2 className="animate-spin" size={48} color="var(--primary)" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="card" style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
                {error}
            </div>
        );
    }

    const averageScore = data.length > 0 ? Math.round(data.reduce((acc, curr) => acc + curr.score, 0) / data.length) : 0;
    const topPerformer = data[0];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Header / Stats Overlay */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '1rem', background: '#e0e7ff', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Company Average</p>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '700' }}>{averageScore}%</h3>
                    </div>
                </div>

                <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '1rem', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Award size={24} />
                    </div>
                    <div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Top Performer</p>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{topPerformer?.name || 'N/A'}</h3>
                    </div>
                </div>

                <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '1rem', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Users size={24} />
                    </div>
                    <div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Reportees</p>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '700' }}>{data.length}</h3>
                    </div>
                </div>
            </div>

            {/* Performance Table */}
            <div className="card" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Employee Performance Ranking</h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: '#64748b', fontWeight: '600', fontSize: '0.85rem' }}>EMPLOYEE</th>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: '#64748b', fontWeight: '600', fontSize: '0.85rem' }}>TASK ACCURACY</th>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: '#64748b', fontWeight: '600', fontSize: '0.85rem' }}>ATTENDANCE</th>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: '#64748b', fontWeight: '600', fontSize: '0.85rem' }}>LEAVES</th>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: '#64748b', fontWeight: '600', fontSize: '0.85rem' }}>OVERALL SCORE</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((emp, index) => (
                                <tr key={emp.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} className="table-row-hover">
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ 
                                                width: '36px', 
                                                height: '36px', 
                                                borderRadius: '50%', 
                                                background: index === 0 ? 'linear-gradient(45deg, #fbbf24, #f59e0b)' : '#e2e8f0', 
                                                color: index === 0 ? 'white' : '#64748b',
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center',
                                                fontWeight: '700',
                                                fontSize: '0.85rem'
                                            }}>
                                                {emp.name[0]}
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.95rem' }}>{emp.name}</p>
                                                <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{emp.designation} • {emp.department}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ flex: 1, height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                                                <div style={{ width: `${emp.metrics.taskAccuracy}%`, height: '100%', background: emp.metrics.taskAccuracy > 70 ? '#22c55e' : emp.metrics.taskAccuracy > 40 ? '#f59e0b' : '#ef4444' }} />
                                            </div>
                                            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569', minWidth: '35px' }}>{emp.metrics.taskAccuracy}%</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: emp.metrics.attendanceRate > 80 ? '#16a34a' : '#d97706', fontSize: '0.9rem', fontWeight: '500' }}>
                                            {emp.metrics.attendanceRate > 80 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                            {emp.metrics.attendanceRate}%
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem', color: '#64748b', fontSize: '0.9rem' }}>
                                        {emp.metrics.leaveDays} Days
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <span style={{ 
                                            padding: '0.3rem 0.8rem', 
                                            borderRadius: '2rem', 
                                            background: emp.score > 80 ? '#dcfce7' : emp.score > 60 ? '#fef3c7' : '#fee2e2',
                                            color: emp.score > 80 ? '#166534' : emp.score > 60 ? '#92400e' : '#991b1b',
                                            fontWeight: '700',
                                            fontSize: '0.85rem'
                                        }}>
                                            {emp.score}%
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
};

export default Performance;
