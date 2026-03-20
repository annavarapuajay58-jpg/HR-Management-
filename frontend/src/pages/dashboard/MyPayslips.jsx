import React, { useState, useEffect } from 'react';
import { Download, Search, FileText, Loader2, Calendar, Archive } from 'lucide-react';
import api from '../../api';

const MyPayslips = () => {
    const [payslips, setPayslips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [downloading, setDownloading] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPayslips();
    }, []);

    const fetchPayslips = async (search = '') => {
        setLoading(true);
        try {
            let url = '/payslips/my';
            if (search) {
                // Parse search term: e.g. "January 2026" or "2026"
                const parts = search.split(' ');
                if (parts.length === 2) {
                    url += `?month=${parts[0]}&year=${parts[1]}`;
                } else if (parts.length === 1 && !isNaN(parts[0])) {
                    url += `?year=${parts[0]}`;
                }
            }
            const response = await api.get(url);
            setPayslips(response.data);
            setError(null);
        } catch (err) {
            console.error('Fetch payslips error:', err);
            setError('Failed to load payslips.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchPayslips(searchTerm);
    };

    const downloadSingle = async (id, month, year) => {
        setDownloading(id);
        try {
            const response = await api.get(`/payslips/download/${id}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Payslip-${month}-${year}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Download error:', err);
            alert('Failed to download payslip.');
        } finally {
            setDownloading(null);
        }
    };

    const downloadYearly = async (year) => {
        setDownloading(`year-${year}`);
        try {
            const response = await api.get(`/payslips/download-year/${year}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Payslips-${year}.zip`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Download error:', err);
            alert('Failed to download yearly payslips.');
        } finally {
            setDownloading(null);
        }
    };

    // Determine if we are viewing a specific year to show bulk download
    const searchYear = searchTerm.split(' ').pop();
    const isYearSearch = !isNaN(searchYear) && searchYear.length === 4;

    return (
        <div style={{ padding: '1rem' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>My Payslips</h2>
                    <p style={{ color: 'var(--text-muted)' }}>View and download your monthly salary statements</p>
                </div>

                <form onSubmit={handleSearch} style={{ position: 'relative', width: '350px', display: 'flex', gap: '0.5rem' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
                        <input
                            type="text"
                            placeholder="Search (e.g. 'January 2026' or '2026')"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem 0.75rem 2.5rem',
                                borderRadius: '0.75rem',
                                border: '1.5px solid #e2e8f0',
                                outline: 'none',
                                fontSize: '0.9rem'
                            }}
                        />
                    </div>
                    <button 
                        type="submit"
                        style={{ 
                            padding: '0 1.25rem', 
                            background: 'var(--primary)', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '0.75rem', 
                            fontWeight: '600', 
                            cursor: 'pointer' 
                        }}
                    >
                        Search
                    </button>
                </form>
            </div>

            {error && <div style={{ padding: '1rem', background: '#fee2e2', color: '#dc2626', borderRadius: '0.75rem', marginBottom: '1.5rem' }}>{error}</div>}

            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                {isYearSearch && payslips.length > 0 && (
                    <button
                        onClick={() => downloadYearly(searchYear)}
                        disabled={downloading === `year-${searchYear}`}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.25rem',
                            background: '#0f172a',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.75rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            opacity: downloading === `year-${searchYear}` ? 0.7 : 1
                        }}
                    >
                        {downloading === `year-${searchYear}` ? <Loader2 className="animate-spin" size={18} /> : <Archive size={18} />}
                        Download All {searchYear} Payslips
                    </button>
                )}
            </div>

            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0' }}>
                                <th style={{ padding: '1.25rem 1.5rem', fontWeight: '600', color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' }}>Period</th>
                                <th style={{ padding: '1.25rem 1.5rem', fontWeight: '600', color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' }}>Basic Salary</th>
                                <th style={{ padding: '1.25rem 1.5rem', fontWeight: '600', color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' }}>Bonus</th>
                                <th style={{ padding: '1.25rem 1.5rem', fontWeight: '600', color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' }}>Deductions</th>
                                <th style={{ padding: '1.25rem 1.5rem', fontWeight: '600', color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' }}>Net Salary</th>
                                <th style={{ padding: '1.25rem 1.5rem', fontWeight: '600', color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', textAlign: 'right' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: '3rem', textAlign: 'center' }}>
                                        <Loader2 className="animate-spin" style={{ margin: '0 auto', color: 'var(--primary)' }} size={32} />
                                    </td>
                                </tr>
                            ) : payslips.length > 0 ? (
                                payslips.map((slip) => (
                                    <tr key={slip._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ width: '36px', height: '36px', borderRadius: '0.5rem', background: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Calendar size={18} />
                                                </div>
                                                <div>
                                                    <p style={{ fontWeight: '600', color: '#1e293b' }}>{slip.month} {slip.year}</p>
                                                    <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Issued on {new Date(slip.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem', color: '#475569' }}>₹ {slip.basicSalary.toLocaleString()}</td>
                                        <td style={{ padding: '1rem 1.5rem', color: '#10b981' }}>+ ₹ {slip.bonus.toLocaleString()}</td>
                                        <td style={{ padding: '1rem 1.5rem', color: '#ef4444' }}>- ₹ {slip.deductions.toLocaleString()}</td>
                                        <td style={{ padding: '1rem 1.5rem', fontWeight: '700', color: '#0f172a' }}>₹ {slip.netSalary.toLocaleString()}</td>
                                        <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                            <button
                                                onClick={() => downloadSingle(slip._id, slip.month, slip.year)}
                                                disabled={!!downloading}
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '0.5rem',
                                                    border: '1.5px solid #e2e8f0',
                                                    background: 'white',
                                                    color: '#1e293b',
                                                    fontWeight: '600',
                                                    fontSize: '0.85rem',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    opacity: downloading === slip._id ? 0.7 : 1
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                                                onMouseOut={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                                            >
                                                {downloading === slip._id ? <Loader2 className="animate-spin" size={14} /> : <Download size={14} />}
                                                Download
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" style={{ padding: '4rem', textAlign: 'center' }}>
                                        <FileText size={48} style={{ color: '#e2e8f0', marginBottom: '1rem' }} />
                                        <p style={{ color: '#64748b', fontWeight: '500' }}>No payslips found for this period.</p>
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

export default MyPayslips;
