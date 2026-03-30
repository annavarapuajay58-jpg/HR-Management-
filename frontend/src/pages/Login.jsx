import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            navigate('/dashboard');
        } catch (err) {
            console.error('Login Error:', err);
            if (!err.response) {
                setError('Network error: Unable to connect to the server. Please ensure the backend is running.');
                return;
            }
            const data = err.response.data;
            if (data?.needsVerification && data?.email) {
                // Redirect to verify page with message
                navigate(`/verify-code?email=${encodeURIComponent(data.email)}`);
                return;
            }
            setError(data?.error || 'Login failed. Please try again.');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>HR Management</h2>
                <form onSubmit={handleSubmit}>
                    {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}
                    <div className="input-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@company.com"
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <div style={{ textAlign: 'right', marginBottom: '1rem', marginTop: '-0.5rem' }}>
                        <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600' }}>Forgot password?</Link>
                    </div>
                    <button type="submit" className="btn btn-primary">Login</button>
                </form>
                <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
                    Don't have an account? <Link to="/signup" style={{ color: 'var(--primary)', fontWeight: '600' }}>Sign Up</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
