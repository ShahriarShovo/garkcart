import React, { useState, useEffect } from 'react';
import AdminUserManagementApi from './api/adminUserManagementApi';

const AdminUserManagement = ({ user, onClose, onSuccess }) => {
    const [userDetails, setUserDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // Profile form data
    const [profileData, setProfileData] = useState({
        full_name: '',
        username: '',
        phone: '',
        address: '',
    });

    // Password form data
    const [passwordData, setPasswordData] = useState({
        new_password: '',
        confirm_password: '',
    });

    // Password visibility states
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // User basic info form data
    const [userData, setUserData] = useState({
        email: '',
        is_active: true,
        is_staff: false,
        is_superuser: false,
    });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: '', type: 'success' });
        }, 5000);
    };

    useEffect(() => {
        if (user && user.id) {
            loadUserDetails();
        }
    }, [user]);

    const loadUserDetails = async () => {
        setLoading(true);
        try {
            const response = await AdminUserManagementApi.getUserDetails(user.id);
            if (response.success) {
                setUserDetails(response.data);
                
                // Set form data
                setProfileData({
                    full_name: response.data.profile?.full_name || '',
                    username: response.data.profile?.username || '',
                    phone: response.data.profile?.phone || '',
                    address: response.data.profile?.address || '',
                });

                setUserData({
                    email: response.data.email,
                    is_active: response.data.is_active,
                    is_staff: response.data.is_staff,
                    is_superuser: response.data.is_superuser,
                });
            }
        } catch (error) {
            showToast(`Error loading user details: ${error.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async () => {
        setSaving(true);
        try {
            await AdminUserManagementApi.updateUserProfile(user.id, {
                profile: profileData
            });
            showToast('Profile updated successfully!', 'success');
            onSuccess();
        } catch (error) {
            showToast(`Error updating profile: ${error.message}`, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async () => {
        if (passwordData.new_password !== passwordData.confirm_password) {
            showToast('Passwords do not match!', 'error');
            return;
        }

        if (passwordData.new_password.length < 6) {
            showToast('Password must be at least 6 characters!', 'error');
            return;
        }

        setSaving(true);
        try {
            await AdminUserManagementApi.changeUserPassword(
                user.id,
                passwordData.new_password,
                passwordData.confirm_password
            );
            showToast('Password changed successfully!', 'success');
            setPasswordData({ new_password: '', confirm_password: '' });
            setShowNewPassword(false);
            setShowConfirmPassword(false);
        } catch (error) {
            showToast(`Error changing password: ${error.message}`, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleUserInfoUpdate = async () => {
        setSaving(true);
        try {
            await AdminUserManagementApi.updateUserBasicInfo(user.id, userData);
            showToast('User information updated successfully!', 'success');
            onSuccess();
        } catch (error) {
            showToast(`Error updating user info: ${error.message}`, 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-body text-center py-4">
                            <i className="fa fa-spinner fa-spin fa-2x text-primary"></i>
                            <p className="mt-3">Loading user details...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            <i className="fa fa-user-cog mr-2"></i>
                            Manage User - {user?.full_name || user?.email}
                        </h5>
                        <button type="button" className="close" onClick={onClose}>
                            <span>&times;</span>
                        </button>
                    </div>

                    <div className="modal-body">
                        {toast.show && (
                            <div className={`alert alert-${toast.type === 'error' ? 'danger' : 'success'} alert-dismissible fade show`}>
                                <i className={`fa ${toast.type === 'error' ? 'fa-exclamation-triangle' : 'fa-check-circle'} mr-2`}></i>
                                {toast.message}
                                <button type="button" className="close" onClick={() => setToast({ show: false, message: '', type: 'success' })}>
                                    <span>&times;</span>
                                </button>
                            </div>
                        )}

                        {/* Tab Navigation */}
                        <ul className="nav nav-tabs mb-4">
                            <li className="nav-item">
                                <button 
                                    className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('profile')}
                                >
                                    <i className="fa fa-user mr-1"></i> Profile
                                </button>
                            </li>
                            <li className="nav-item">
                                <button 
                                    className={`nav-link ${activeTab === 'password' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('password')}
                                >
                                    <i className="fa fa-key mr-1"></i> Password
                                </button>
                            </li>
                            <li className="nav-item">
                                <button 
                                    className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('settings')}
                                >
                                    <i className="fa fa-cog mr-1"></i> Settings
                                </button>
                            </li>
                        </ul>

                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div>
                                <h6 className="mb-3">Profile Information</h6>
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label>Full Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={profileData.full_name}
                                                onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label>Username</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={profileData.username}
                                                onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label>Phone</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={profileData.phone}
                                                onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label>Address</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={profileData.address}
                                                onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    className="btn btn-primary"
                                    onClick={handleProfileUpdate}
                                    disabled={saving}
                                >
                                    {saving ? <i className="fa fa-spinner fa-spin mr-1"></i> : <i className="fa fa-save mr-1"></i>}
                                    Update Profile
                                </button>
                            </div>
                        )}

                        {/* Password Tab */}
                        {activeTab === 'password' && (
                            <div>
                                <h6 className="mb-3">Change Password</h6>
                                <div className="form-group">
                                    <label>New Password</label>
                                    <div className="input-group">
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            className="form-control"
                                            value={passwordData.new_password}
                                            onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                                            placeholder="Enter new password"
                                        />
                                        <div className="input-group-append">
                                            <button
                                                className="btn btn-outline-secondary"
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                            >
                                                <i className={`fa ${showNewPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                            </button>
                                        </div>
                                    </div>
                                    <small className="text-muted">
                                        <i className="fa fa-info-circle mr-1"></i>
                                        Password must be at least 6 characters
                                    </small>
                                </div>
                                <div className="form-group">
                                    <label>Confirm Password</label>
                                    <div className="input-group">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            className="form-control"
                                            value={passwordData.confirm_password}
                                            onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                                            placeholder="Confirm new password"
                                        />
                                        <div className="input-group-append">
                                            <button
                                                className="btn btn-outline-secondary"
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            >
                                                <i className={`fa ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    className="btn btn-warning"
                                    onClick={handlePasswordChange}
                                    disabled={saving}
                                >
                                    {saving ? <i className="fa fa-spinner fa-spin mr-1"></i> : <i className="fa fa-key mr-1"></i>}
                                    Change Password
                                </button>
                            </div>
                        )}

                        {/* Settings Tab */}
                        {activeTab === 'settings' && (
                            <div>
                                <h6 className="mb-3">User Settings</h6>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        value={userData.email}
                                        onChange={(e) => setUserData({...userData, email: e.target.value})}
                                    />
                                </div>
                                <div className="form-check mb-2">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        checked={userData.is_active}
                                        onChange={(e) => setUserData({...userData, is_active: e.target.checked})}
                                    />
                                    <label className="form-check-label">Active User</label>
                                </div>
                                <div className="form-check mb-2">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        checked={userData.is_staff}
                                        onChange={(e) => setUserData({...userData, is_staff: e.target.checked})}
                                    />
                                    <label className="form-check-label">Staff User</label>
                                </div>
                                <div className="form-check mb-3">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        checked={userData.is_superuser}
                                        onChange={(e) => setUserData({...userData, is_superuser: e.target.checked})}
                                    />
                                    <label className="form-check-label">Super User</label>
                                </div>
                                <button 
                                    className="btn btn-success"
                                    onClick={handleUserInfoUpdate}
                                    disabled={saving}
                                >
                                    {saving ? <i className="fa fa-spinner fa-spin mr-1"></i> : <i className="fa fa-save mr-1"></i>}
                                    Update Settings
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            <i className="fa fa-times mr-1"></i> Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminUserManagement;
