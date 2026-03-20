import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';

const VerifyCode = () => {
    const [searchParams] = useSearchParams();
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const navigate = useNavigate();
    const email = searchParams.get('email');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (code.length !== 6) {
            setError('Please enter a 6-digit code.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const response = await api.post('/auth/verify-code', { email, code });
            setMessage(response.data.message);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Verification failed. Please check the code.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        setError('');
        setMessage('');
        try {
            const res = await api.post('/auth/resend-verification', { email });
            setMessage(res.data.message);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to resend. Please try again.');
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card" style={{ textAlign: 'center' }}>
                <h2 style={{ marginBottom: '1rem' }}>Enter Verification Code</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                    We've sent a 6-digit code to <strong>{email}</strong>. Please enter it below.
                </p>

                <form onSubmit={handleSubmit}>
                    {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}
                    {message && <div style={{ color: 'var(--success)', marginBottom: '1rem', fontSize: '0.875rem' }}>{message}</div>}

                    <div className="input-group">
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="000000"
                            style={{
                                textAlign: 'center',
                                fontSize: '2rem',
                                letterSpacing: '10px',
                                fontWeight: '700'
                            }}
                            maxLength="6"
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Verifying...' : 'Verify Code'}
                    </button>
                </form>

                <p style={{ marginTop: '1.5rem', fontSize: '0.875rem' }}>
                    Didn't receive the code? <button onClick={handleResend} disabled={resending} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: '600' }}>{resending ? 'Sending...' : 'Resend'}</button>
                </p>

                <div style={{ marginTop: '1rem' }}>
                    <Link to="/signup" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Back to Signup</Link>
                </div>
            </div>
        </div>
    );
};

export default VerifyCode;