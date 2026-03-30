import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

const Signup = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        employeeId: '',
        role: 'Employee'
    });
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        try {
            const response = await api.post('/auth/register', formData);
            setMessage(response.data.message);
            // Redirect to verification code page (handles both new reg and resent code)
            setTimeout(() => navigate(`/verify-code?email=${encodeURIComponent(formData.email)}`), 2000);
        } catch (err) {
            console.error('Signup Error:', err);
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card" style={{ maxWidth: '450px' }}>
                <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Create Account</h2>
                <form onSubmit={handleSubmit}>
                    {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}
                    {message && <div style={{ color: 'var(--success)', marginBottom: '1rem', fontSize: '0.875rem' }}>{message}</div>}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="input-group">
                            <label>First Name</label>
                            <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
                        </div>
                        <div className="input-group">
                            <label>Last Name</label>
                            <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Employee ID</label>
                        <input type="text" name="employeeId" value={formData.employeeId} onChange={handleChange} placeholder="e.g. EMP001" required />
                    </div>

                    <div className="input-group">
                        <label>Phone Number</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="e.g. +1234567890" />
                    </div>

                    <div className="input-group">
                        <label>Email Address</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} required />
                    </div>

                    <div className="input-group">
                        <label>Register As</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}
                        >
                            <option value="Employee">Employee</option>
                            <option value="Teamlead">Teamlead</option>
                            <option value="HR">HR</option>
                        </select>
                    </div>

                    <button type="submit" className="btn btn-primary">Sign Up</button>
                </form>
                <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;
