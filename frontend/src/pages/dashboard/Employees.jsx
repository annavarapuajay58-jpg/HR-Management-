import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Search, Users, User, Mail, Briefcase, RefreshCw, Shield, UserCheck } from 'lucide-react';

const roleColors = {
    Employee: { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
    Teamlead: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
    HR: { bg: '#fdf4ff', color: '#9333ea', border: '#e9d5ff' },
    Admin: { bg: '#fff7ed', color: '#ea580c', border: '#fed7aa' },
};

const RoleBadge = ({ role }) => {
    const style = roleColors[role] || roleColors.Employee;
    return (
        <span style={{
            fontSize: '0.7rem',
            fontWeight: '700',
            padding: '0.2rem 0.6rem',
            borderRadius: '999px',
            background: style.bg,
            color: style.color,
            border: `1px solid ${style.border}`,
            letterSpacing: '0.03em',
            textTransform: 'uppercase'
        }}>
            {role}
        </span>
    );
};

const Avatar = ({ name, size = 44 }) => {
    const initials = name
        ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
        : '?';
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#0ea5e9', '#10b981', '#f59e0b'];
    const colorIdx = (name?.charCodeAt(0) || 0) % colors.length;
    return (
        <div style={{
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${colors[colorIdx]}, ${colors[(colorIdx + 1) % colors.length]})`,
            color: 'white',
            fontWeight: '700',
            fontSize: `${size * 0.38}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
        }}>
            {initials}
        </div>
    );
};

const Employees = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');

    const fetchEmployees = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get('/team/employees');
            setEmployees(res.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load employees.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEmployees(); }, []);

    const filteredEmployees = employees.filter(emp => {
        const matchesSearch =
            emp.name?.toLowerCase().includes(search.toLowerCase()) ||
            emp.email?.toLowerCase().includes(search.toLowerCase()) ||
            emp.designation?.toLowerCase().includes(search.toLowerCase());
        const matchesRole = roleFilter === 'All' || emp.role === roleFilter || emp.designation === roleFilter;
        return matchesSearch && matchesRole;
    });

    const roleCounts = employees.reduce((acc, emp) => {
        const role = emp.role || emp.designation || 'Employee';
        acc[role] = (acc[role] || 0) + 1;
        return acc;
    }, {});

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.25rem' }}>
                        Employee Directory
                    </h2>
                    <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                        {employees.length} total registered employees
                    </p>
                </div>
                <button
                    onClick={fetchEmployees}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.5rem 1rem', borderRadius: '0.5rem',
                        border: '1.5px solid #e2e8f0', background: 'white',
                        color: '#475569', fontWeight: '600', fontSize: '0.85rem',
                        cursor: 'pointer', transition: 'all 0.2s'
                    }}
                    onMouseOver={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#6366f1'; }}
                    onMouseOut={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                >
                    <RefreshCw size={15} />
                    Refresh
                </button>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Total', value: employees.length, icon: <Users size={20} />, color: '#6366f1', bg: '#eff6ff' },
                    { label: 'Employees', value: roleCounts['Employee'] || 0, icon: <User size={20} />, color: '#2563eb', bg: '#eff6ff' },
                    { label: 'Team Leads', value: roleCounts['Teamlead'] || 0, icon: <UserCheck size={20} />, color: '#16a34a', bg: '#f0fdf4' },
                    { label: 'HR', value: roleCounts['HR'] || 0, icon: <Shield size={20} />, color: '#9333ea', bg: '#fdf4ff' },
                ].map((stat, i) => (
                    <div key={i} style={{
                        background: 'white',
                        borderRadius: '0.75rem',
                        padding: '1rem 1.25rem',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                    }}>
                        <div style={{
                            width: '38px', height: '38px', borderRadius: '0.5rem',
                            background: stat.bg, color: stat.color,
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            {stat.icon}
                        </div>
                        <div>
                            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1e293b', lineHeight: 1 }}>{stat.value}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search & Filter */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                    <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                        type="text"
                        placeholder="Search by name, email, or role..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.6rem 0.75rem 0.6rem 2.25rem',
                            borderRadius: '0.5rem',
                            border: '1.5px solid #e2e8f0',
                            fontSize: '0.875rem',
                            outline: 'none',
                            transition: 'border-color 0.2s',
                            boxSizing: 'border-box'
                        }}
                        onFocus={e => e.target.style.borderColor = '#6366f1'}
                        onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                    />
                </div>
                <select
                    value={roleFilter}
                    onChange={e => setRoleFilter(e.target.value)}
                    style={{
                        padding: '0.6rem 1rem',
                        borderRadius: '0.5rem',
                        border: '1.5px solid #e2e8f0',
                        fontSize: '0.875rem',
                        background: 'white',
                        cursor: 'pointer',
                        outline: 'none',
                        color: '#475569',
                        fontWeight: '500'
                    }}
                >
                    <option value="All">All Roles</option>
                    <option value="Employee">Employee</option>
                    <option value="Teamlead">Team Lead</option>
                    <option value="HR">HR</option>
                </select>
            </div>

            {/* Content */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: '#94a3b8', gap: '0.75rem', flexDirection: 'column' }}>
                    <div style={{ width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    <span style={{ fontSize: '0.875rem' }}>Loading employees...</span>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            ) : error ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#ef4444', background: '#fef2f2', borderRadius: '0.75rem', border: '1px solid #fecaca' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚠️</div>
                    <p style={{ fontWeight: '600' }}>{error}</p>
                </div>
            ) : filteredEmployees.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b', background: '#f8fafc', borderRadius: '0.75rem', border: '1px dashed #e2e8f0' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>👥</div>
                    <p style={{ fontWeight: '600', fontSize: '1rem', color: '#475569' }}>
                        {employees.length === 0 ? 'No employees registered yet.' : 'No employees match your search.'}
                    </p>
                    <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                        {employees.length === 0 ? 'Employees will appear here once they register.' : 'Try adjusting your search or filter.'}
                    </p>
                </div>
            ) : (
                <div style={{
                    background: 'white',
                    borderRadius: '0.75rem',
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                }}>
                    {/* Table Header */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 2fr 1fr 1fr',
                        padding: '0.75rem 1.25rem',
                        background: '#f8fafc',
                        borderBottom: '1px solid #e2e8f0',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        <span>Employee</span>
                        <span>Email</span>
                        <span>Department / Role</span>
                        <span>Status</span>
                    </div>

                    {/* Table Rows */}
                    {filteredEmployees.map((emp, i) => (
                        <div
                            key={emp._id}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '2fr 2fr 1fr 1fr',
                                padding: '1rem 1.25rem',
                                borderBottom: i < filteredEmployees.length - 1 ? '1px solid #f1f5f9' : 'none',
                                alignItems: 'center',
                                transition: 'background 0.15s'
                            }}
                            onMouseOver={e => e.currentTarget.style.background = '#fafafe'}
                            onMouseOut={e => e.currentTarget.style.background = 'white'}
                        >
                            {/* Name + Avatar */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Avatar name={emp.name} size={40} />
                                <div>
                                    <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.9rem' }}>{emp.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.1rem' }}>
                                        {emp.designation && emp.designation !== emp.role ? emp.designation : '—'}
                                    </div>
                                </div>
                            </div>
                            {/* Email */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#475569', fontSize: '0.85rem', overflow: 'hidden' }}>
                                <Mail size={13} style={{ color: '#94a3b8', flexShrink: 0 }} />
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{emp.email}</span>
                            </div>
                            {/* Role */}
                            <div>
                                <RoleBadge role={emp.role || emp.designation || 'Employee'} />
                            </div>
                            {/* Status */}
                            <div>
                                <span style={{
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    padding: '0.2rem 0.6rem',
                                    borderRadius: '999px',
                                    background: '#f0fdf4',
                                    color: '#16a34a',
                                    border: '1px solid #bbf7d0'
                                }}>
                                    ● Active
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Footer count */}
            {!loading && !error && filteredEmployees.length > 0 && (
                <p style={{ textAlign: 'right', fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.75rem' }}>
                    Showing {filteredEmployees.length} of {employees.length} employees
                </p>
            )}
        </div>
    );
};

export default Employees;
