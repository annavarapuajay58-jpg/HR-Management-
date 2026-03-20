import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [otpRequired, setOtpRequired] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // Enforce the gate
        const gatePassed = sessionStorage.getItem('admin_gate_passed');
        if (gatePassed !== 'true') {
            navigate('/admin');
        }
    }, [navigate]);

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        const password = sessionStorage.getItem('admin_master_password');
        if (!password) {
            setError('Master password session expired. Please return to the previous screen.');
            return;
        }

        try {
            const response = await api.post('/auth/admin-login', { email, password });
            
            if (response.data.otpRequired) {
                setOtpRequired(true);
                setMessage(response.data.message);
            }
        } catch (err) {
            if (!err.response) {
                setError('Network error: Unable to connect to the server. Please ensure the backend is running.');
                return;
            }
            setError(err.response?.data?.error || 'Login failed');
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await api.post('/auth/verify-admin-otp', { email, code: otp });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            // Clear session gate after successful login
            sessionStorage.removeItem('admin_gate_passed');
            sessionStorage.removeItem('admin_master_password');
            navigate('/dashboard');
        } catch (err) {
            if (!err.response) {
                setError('Network error: Unable to connect to the server. Please ensure the backend is running.');
                return;
            }
            setError(err.response?.data?.error || 'OTP verification failed');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Admin Login</h2>
                
                {message && <div style={{ color: 'var(--primary)', marginBottom: '1rem', fontSize: '0.875rem', textAlign: 'center', fontWeight: 'bold' }}>{message}</div>}
                {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', fontSize: '0.875rem', textAlign: 'center' }}>{error}</div>}

                {!otpRequired ? (
                    <form onSubmit={handleLoginSubmit}>
                        <div className="input-group">
                            <label>Admin Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@company.com"
                                required
                            />
                        </div>

                        <button type="submit" className="btn btn-primary">Login</button>
                    </form>
                ) : (
                    <form onSubmit={handleOtpSubmit}>
                        <p style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '0.9rem' }}>
                            Enter the 6-digit code sent to your email.
                        </p>
                        <div className="input-group">
                            <label>Verification Code</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="123456"
                                maxLength="6"
                                required
                                style={{ textAlign: 'center', letterSpacing: '4px', fontSize: '1.2rem' }}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary">Verify & Login</button>
                        <button 
                            type="button" 
                            className="btn" 
                            style={{ marginTop: '1rem', background: 'transparent', color: 'var(--primary)', border: '1px solid var(--primary)' }}
                            onClick={() => setOtpRequired(false)}
                        >
                            Back to Login
                        </button>
                    </form>
                )}
                
                {!otpRequired && (
                    <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
                        Not an Admin? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>Employee Login</Link>
                    </p>
                )}
            </div>
        </div>
    );
};

export default AdminLogin;
