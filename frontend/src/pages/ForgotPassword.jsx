import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

const ForgotPassword = () => {
    const navigate = useNavigate();

    // Steps: 1 = enter email, 2 = enter OTP, 3 = set new password
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // Step 1: Request OTP
    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/auth/forgot-password', { email });
            setMessage(res.data.message);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyCode = async (e) => {
        e.preventDefault();
        if (code.length !== 6) {
            setError('Please enter a valid 6-digit code.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            await api.post('/auth/verify-reset-code', { email, code });
            setMessage('Code verified! Please set your new password.');
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid or expired code.');
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/auth/reset-password', { email, code, password });
            setMessage(res.data.message);
            setTimeout(() => navigate('/login'), 2500);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to reset password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const stepTitles = ['Forgot Password', 'Enter Verification Code', 'Set New Password'];
    const stepDescriptions = [
        'Enter your registered email address. We\'ll send you a 6-digit reset code.',
        `A 6-digit code has been sent to ${email}. Enter it below.`,
        'Your code is verified. Create a strong new password.'
    ];

    return (
        <div className="auth-container">
            <div className="auth-card" style={{ maxWidth: '420px' }}>
                {/* Step Indicators */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    {[1, 2, 3].map(s => (
                        <div key={s} style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.85rem', fontWeight: '700',
                            background: s < step ? 'var(--primary)' : s === step ? 'var(--primary)' : 'var(--border)',
                            color: s <= step ? 'white' : 'var(--text-muted)',
                            opacity: s < step ? 0.7 : 1,
                            transition: 'all 0.3s ease'
                        }}>
                            {s < step ? '✓' : s}
                        </div>
                    ))}
                </div>

                <h2 style={{ marginBottom: '0.5rem', textAlign: 'center' }}>{stepTitles[step - 1]}</h2>
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                    {stepDescriptions[step - 1]}
                </p>

                {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', fontSize: '0.875rem', padding: '0.75rem', background: '#fef2f2', borderRadius: '0.5rem', border: '1px solid #fecaca' }}>{error}</div>}
                {message && step !== 3 && <div style={{ color: 'var(--success)', marginBottom: '1rem', fontSize: '0.875rem', padding: '0.75rem', background: '#f0fdf4', borderRadius: '0.5rem', border: '1px solid #bbf7d0' }}>{message}</div>}

                {/* Step 1: Email */}
                {step === 1 && (
                    <form onSubmit={handleForgotPassword}>
                        <div className="input-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@company.com"
                                required
                                autoFocus
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Sending...' : 'Send Reset Code'}
                        </button>
                    </form>
                )}

                {/* Step 2: OTP */}
                {step === 2 && (
                    <form onSubmit={handleVerifyCode}>
                        <div className="input-group">
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="000000"
                                style={{ textAlign: 'center', fontSize: '2rem', letterSpacing: '10px', fontWeight: '700' }}
                                maxLength="6"
                                required
                                autoFocus
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Verifying...' : 'Verify Code'}
                        </button>
                        <button
                            type="button"
                            onClick={() => { setStep(1); setCode(''); setError(''); setMessage(''); }}
                            style={{ width: '100%', marginTop: '0.75rem', background: 'none', border: '1px solid var(--border)', borderRadius: '0.5rem', padding: '0.75rem', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.875rem' }}
                        >
                            ← Use a different email
                        </button>
                    </form>
                )}

                {/* Step 3: New Password */}
                {step === 3 && (
                    <form onSubmit={handleResetPassword}>
                        <div className="input-group">
                            <label>New Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                autoFocus
                                minLength={6}
                            />
                        </div>
                        <div className="input-group">
                            <label>Confirm New Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>
                        {message && <div style={{ color: 'var(--success)', marginBottom: '1rem', fontSize: '0.875rem', padding: '0.75rem', background: '#f0fdf4', borderRadius: '0.5rem', border: '1px solid #bbf7d0' }}>{message}</div>}
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Resetting...' : 'Reset Password & Login'}
                        </button>
                    </form>
                )}

                <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
                    Remembered your password?{' '}
                    <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>Login</Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;
