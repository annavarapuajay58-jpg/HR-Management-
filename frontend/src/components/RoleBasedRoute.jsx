import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const RoleBasedRoute = ({ allowedRoles }) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user.role;

    if (!role) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(role)) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                fontFamily: 'sans-serif'
            }}>
                <h1 style={{ color: 'var(--danger)' }}>403 - Forbidden</h1>
                <p>You do not have permission to access this resource.</p>
                <button
                    onClick={() => window.location.href = '/dashboard'}
                    className="btn btn-primary"
                    style={{ width: 'auto', marginTop: '1rem' }}
                >
                    Return to Dashboard
                </button>
            </div>
        );
    }

    return <Outlet />;
};

export default RoleBasedRoute;
