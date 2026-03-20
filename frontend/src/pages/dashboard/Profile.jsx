import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Shield, Briefcase, Hash, Loader2, Camera } from 'lucide-react';
import api from '../../api';

const Profile = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [editData, setEditData] = useState({ firstName: '', lastName: '', phone: '' });
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/auth/profile');
                const data = response.data;
                setUserData(data);
                setEditData({ firstName: data.firstName, lastName: data.lastName, phone: data.phone || '' });
                // Update localStorage with the latest data to keep header in sync
                localStorage.setItem('user', JSON.stringify(data));
            } catch (err) {
                console.error('Fetch profile error:', err);
                setError(err.response?.data?.error || 'An error occurred while fetching profile');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleEditToggle = () => {
        if (editMode) {
            // Cancel: reset editData
            setEditData({ firstName: userData.firstName, lastName: userData.lastName, phone: userData.phone || '' });
        }
        setEditMode(!editMode);
    };

    const handleInputChange = (e) => {
        setEditData({ ...editData, [e.target.name]: e.target.value });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
            alert('Please select an image file (.png, .jpg, .jpeg)');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result;
            setSaving(true);
            try {
                const response = await api.put('/auth/update-profile', { ...editData, profileImage: base64String });
                const data = response.data;
                setUserData(data.user);
                localStorage.setItem('user', JSON.stringify(data.user));
                window.dispatchEvent(new Event('userUpdate'));
            } catch (err) {
                console.error('Image upload error:', err);
                alert('Failed to upload image.');
            } finally {
                setSaving(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            const response = await api.put('/auth/update-profile', editData);
            const data = response.data;
            setUserData(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
            window.dispatchEvent(new Event('userUpdate'));
            setEditMode(false);
        } catch (err) {
            console.error('Update profile error:', err);
            setError(err.response?.data?.error || 'An error occurred while updating profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '1rem' }}>
                <Loader2 className="animate-spin" size={48} color="var(--primary)" />
                <p style={{ color: 'var(--text-muted)' }}>Loading your profile...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <p style={{ color: 'red' }}>{error}</p>
                <button 
                    onClick={() => window.location.reload()}
                    style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '0.5rem' }}
                >
                    Retry
                </button>
            </div>
        );
    }

    const profileFields = [
        { label: 'First Name', value: userData.firstName, icon: <User size={18} /> },
        { label: 'Last Name', value: userData.lastName, icon: <User size={18} /> },
        { label: 'Email Address', value: userData.email, icon: <Mail size={18} /> },
        { label: 'Employee ID', value: userData.employeeId, icon: <Hash size={18} /> },
        { label: 'Phone Number', value: userData.phone, icon: <Briefcase size={18} /> },
        { label: 'Role', value: userData.role, icon: <Shield size={18} /> },
    ];

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>Personal Profile</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Manage and view your account information</p>
                </div>
                {!editMode ? (
                    <button 
                        onClick={handleEditToggle}
                        style={{ padding: '0.5rem 1rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600' }}
                    >
                        Edit Profile
                    </button>
                ) : (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                            onClick={handleSave}
                            disabled={saving}
                            style={{ padding: '0.5rem 1.5rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            {saving ? <Loader2 className="animate-spin" size={16} /> : 'Save'}
                        </button>
                        <button 
                            onClick={handleEditToggle}
                            disabled={saving}
                            style={{ padding: '0.5rem 1rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600' }}
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>

            <div className="card" style={{ padding: '0' }}>
                <div style={{ 
                    padding: '3rem 2rem', 
                    background: 'linear-gradient(135deg, var(--primary), #a855f7)', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    color: 'white',
                    borderTopLeftRadius: '1rem',
                    borderTopRightRadius: '1rem',
                    position: 'relative'
                }}>
                    <div style={{ position: 'relative' }}>
                        <div style={{ 
                            width: '120px', 
                            height: '120px', 
                            borderRadius: '50%', 
                            background: 'rgba(255, 255, 255, 0.2)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            fontSize: '3.5rem',
                            fontWeight: '700',
                            marginBottom: '1rem',
                            border: '4px solid rgba(255, 255, 255, 0.3)',
                            textTransform: 'uppercase',
                            overflow: 'hidden'
                        }}>
                            {userData.profileImage ? (
                                <img src={userData.profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                userData.firstName && userData.firstName !== 'N/A' ? userData.firstName[0] : userData.email[0]
                            )}
                        </div>
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                position: 'absolute',
                                bottom: '15px',
                                right: '5px',
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: 'white',
                                color: 'var(--primary)',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                transition: 'transform 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <Camera size={18} />
                        </button>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleImageUpload} 
                            accept=".png,.jpg,.jpeg" 
                            style={{ display: 'none' }} 
                        />
                    </div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '600' }}>
                        {userData.firstName && userData.firstName !== 'N/A' ? `${userData.firstName} ${userData.lastName}` : (userData.email.split('@')[0])}
                    </h3>
                    <p style={{ opacity: 0.9 }}>{userData.role}</p>
                </div>

                <div style={{ padding: '2rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {profileFields.map((field, index) => (
                            <div key={index} style={{ 
                                padding: '1.25rem', 
                                border: '1px solid #e2e8f0', 
                                borderRadius: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem'
                            }}>
                                <div style={{ 
                                    width: '40px', 
                                    height: '40px', 
                                    borderRadius: '0.5rem', 
                                    background: '#f8fafc', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    color: 'var(--primary)'
                                }}>
                                    {field.icon}
                                </div>
                                 <div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>
                                        {field.label}
                                    </p>
                                    {editMode && (field.label === 'First Name' || field.label === 'Last Name' || field.label === 'Phone Number') ? (
                                        <input 
                                            type="text" 
                                            name={field.label === 'First Name' ? 'firstName' : field.label === 'Last Name' ? 'lastName' : 'phone'}
                                            value={field.label === 'First Name' ? editData.firstName : field.label === 'Last Name' ? editData.lastName : editData.phone}
                                            onChange={handleInputChange}
                                            style={{ 
                                                border: '1px solid var(--primary)', 
                                                borderRadius: '0.25rem', 
                                                padding: '0.25rem 0.5rem',
                                                width: '100%',
                                                marginTop: '0.25rem',
                                                fontWeight: '600',
                                                color: '#1e293b'
                                            }}
                                        />
                                    ) : (
                                        <p style={{ fontWeight: '600', color: '#1e293b' }}>{field.value || 'N/A'}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;

