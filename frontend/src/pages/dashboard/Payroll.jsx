import React, { useState, useEffect } from 'react';
import { IndianRupee, Search, Edit2, Check, X, Loader2, Users } from 'lucide-react';
import api from '../../api';

const Payroll = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editBase, setEditBase] = useState('');
    const [editBonus, setEditBonus] = useState('');
    const [editDeductions, setEditDeductions] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const response = await api.get('/payroll/employees');
            setEmployees(response.data);
        } catch (err) {
            console.error('Fetch employees error:', err);
            setError('Failed to load employees.');
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (employee) => {
        setEditingId(employee._id);
        setEditBase(employee.baseSalary || '0');
        setEditBonus(employee.bonus || '0');
        setEditDeductions(employee.deductions || '0');
    };

    const handleSaveSalary = async (id) => {
        setSaving(true);
        try {
            await api.put(`/payroll/update-salary/${id}`, { 
                baseSalary: parseFloat(editBase),
                bonus: parseFloat(editBonus),
                deductions: parseFloat(editDeductions)
            });
            setEditingId(null);
            fetchEmployees();
        } catch (err) {
            console.error('Update salary error:', err);
            alert('Failed to update salary.');
        } finally {
            setSaving(false);
        }
    };

    const filteredEmployees = employees.filter(emp =>
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.User?.employeeId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.department || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && employees.length === 0) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '1rem' }}>
                <Loader2 className="animate-spin" size={48} color="var(--primary)" />
                <p style={{ color: 'var(--text-muted)' }}>Loading payroll data...</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '1rem' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>Payroll Management</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Set and manage employee salaries</p>
                </div>

                <div style={{ position: 'relative', width: '300px' }}>
                    <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
                    <input
                        type="text"
                        placeholder="Search employee, ID or dept..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.75rem 1rem 0.75rem 2.5rem',
                            borderRadius: '0.75rem',
                            border: '1.5px solid #e2e8f0',
                            outline: 'none',
                            fontSize: '0.95rem'
                        }}
                    />
                </div>
            </div>

            {error && <div style={{ padding: '1rem', background: '#fee2e2', color: '#dc2626', borderRadius: '0.75rem', marginBottom: '1.5rem' }}>{error}</div>}

            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0' }}>
                                <th style={{ padding: '1.25rem 1.5rem', fontWeight: '600', color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' }}>Employee</th>
                                <th style={{ padding: '1.25rem 1.5rem', fontWeight: '600', color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' }}>ID / Dept</th>
                                <th style={{ padding: '1.25rem 1.5rem', fontWeight: '600', color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' }}>Role</th>
                                <th style={{ padding: '1.25rem 1.5rem', fontWeight: '600', color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' }}>Base Salary</th>
                                <th style={{ padding: '1.25rem 1.5rem', fontWeight: '600', color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' }}>Bonus</th>
                                <th style={{ padding: '1.25rem 1.5rem', fontWeight: '600', color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' }}>Deductions</th>
                                <th style={{ padding: '1.25rem 1.5rem', fontWeight: '600', color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' }}>Net Salary</th>
                                <th style={{ padding: '1.25rem 1.5rem', fontWeight: '600', color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEmployees.length > 0 ? filteredEmployees.map((emp) => (
                                <tr key={emp._id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#fcfdfe'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.9rem', flexShrink: 0 }}>
                                                {emp.profileImage ? <img src={emp.profileImage} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : emp.firstName[0]}
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: '600', color: '#1e293b' }}>{emp.firstName} {emp.lastName}</p>
                                                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{emp.User?.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <p style={{ fontWeight: '600', color: '#1e293b' }}>{emp.User?.employeeId || 'N/A'}</p>
                                        <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{emp.department || 'N/A'}</p>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '2rem',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            background: emp.User?.role === 'Admin' ? '#fef3c7' : emp.User?.role === 'HR' ? '#dcfce7' : '#e0f2fe',
                                            color: emp.User?.role === 'Admin' ? '#92400e' : emp.User?.role === 'HR' ? '#166534' : '#075985'
                                        }}>
                                            {emp.User?.role}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        {editingId === emp._id ? (
                                            <input type="number" value={editBase} onChange={(e) => setEditBase(e.target.value)} style={{ width: '80px', padding: '0.4rem', borderRadius: '0.3rem', border: '1px solid #cbd5e1', outline: 'none' }} autoFocus />
                                        ) : (
                                            <span style={{ fontWeight: '600', color: '#334155' }}>₹ {emp.baseSalary ? parseFloat(emp.baseSalary).toLocaleString() : '0'}</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        {editingId === emp._id ? (
                                            <input type="number" value={editBonus} onChange={(e) => setEditBonus(e.target.value)} style={{ width: '80px', padding: '0.4rem', borderRadius: '0.3rem', border: '1px solid #cbd5e1', outline: 'none' }} />
                                        ) : (
                                            <span style={{ color: '#059669', fontWeight: '500' }}>+ ₹ {emp.bonus ? parseFloat(emp.bonus).toLocaleString() : '0'}</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        {editingId === emp._id ? (
                                            <input type="number" value={editDeductions} onChange={(e) => setEditDeductions(e.target.value)} style={{ width: '80px', padding: '0.4rem', borderRadius: '0.3rem', border: '1px solid #cbd5e1', outline: 'none' }} />
                                        ) : (
                                            <span style={{ color: '#ef4444', fontWeight: '500' }}>- ₹ {emp.deductions ? parseFloat(emp.deductions).toLocaleString() : '0'}</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        {editingId === emp._id ? (
                                            <span style={{ fontWeight: '700', color: '#0f172a' }}>₹ {((parseFloat(editBase)||0) + (parseFloat(editBonus)||0) - (parseFloat(editDeductions)||0)).toLocaleString()}</span>
                                        ) : (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <IndianRupee size={15} color="#0f172a" />
                                                <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '1.05rem' }}>
                                                    {emp.netSalary ? parseFloat(emp.netSalary).toLocaleString() : '0'}
                                                </span>
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                        {editingId === emp._id ? (
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                <button
                                                    onClick={() => handleSaveSalary(emp._id)}
                                                    disabled={saving}
                                                    style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#10b981', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                                >
                                                    {saving ? <Loader2 className="animate-spin" size={16} /> : <Check size={18} />}
                                                </button>
                                                <button
                                                    onClick={() => setEditingId(null)}
                                                    style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#ef4444', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleEditClick(emp)}
                                                style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', background: 'white', color: '#1e293b', fontWeight: '600', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                                                onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                                                onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                                            >
                                                <Edit2 size={14} />
                                                Set Salary
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" style={{ padding: '3rem', textAlign: 'center' }}>
                                        <div style={{ color: '#94a3b8', marginBottom: '1rem' }}>
                                            <Users size={48} style={{ opacity: 0.3 }} />
                                        </div>
                                        <p style={{ color: '#64748b', fontWeight: '500' }}>No employees found.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Payroll;
