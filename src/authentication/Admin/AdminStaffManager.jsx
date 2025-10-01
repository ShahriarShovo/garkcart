import React, {useEffect, useState} from 'react';
import AdminRolesApi from './api/adminRolesApi';
import API_CONFIG from '../../config/apiConfig';
import UserPermissionAssignment from './UserPermissionAssignment';
import AdminUserManagement from './AdminUserManagement';
import permissionApi from './api/permissionApi';

const AdminStaffManager = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({show: false, message: '', type: 'success'});
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [showUserManagement, setShowUserManagement] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [createForm, setCreateForm] = useState({
        email: '',
        password: '',
        confirm_password: '',
        full_name: '',
        is_staff: false,
        is_superuser: false
    });
    const [emailError, setEmailError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [validationError, setValidationError] = useState('');
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [updatingUserId, setUpdatingUserId] = useState(null);

    const load = async () => {
        setLoading(true);
        try {
            console.log('🔍 DEBUG: Loading admin/staff users...');
            const list = await AdminRolesApi.listAdminsAndStaff();
            console.log('🔍 DEBUG: Loaded users:', list);
            console.log('🔍 DEBUG: Number of users:', list.length);
            
            // Load user permissions and roles for each user
            const usersWithPermissions = await Promise.all(
                list.map(async (user) => {
                    try {
                        console.log(`🔍 DEBUG: Loading permissions for user ${user.id}...`);
                        const userPermissions = await permissionApi.getUserPermissions();
                        console.log(`🔍 DEBUG: User ${user.id} permissions:`, userPermissions);
                        
                        // Find user's permissions in the response
                        const userData = userPermissions.find(u => u.id === user.id);
                        return {
                            ...user,
                            roles: userData?.roles || [],
                            permissions: userData?.permissions || []
                        };
                    } catch (error) {
                        console.error(`🔍 DEBUG: Error loading permissions for user ${user.id}:`, error);
                        return {
                            ...user,
                            roles: [],
                            permissions: []
                        };
                    }
                })
            );
            
            console.log('🔍 DEBUG: Users with permissions:', usersWithPermissions);
            setUsers(usersWithPermissions);
        } catch (e) {
            console.error('🔍 DEBUG: Error loading users:', e);
            setToast({show: true, message: e.message, type: 'error'});
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const updateRole = async (user, changes) => {
        setUpdatingUserId(user.id);
        try {
            await AdminRolesApi.setUserRole(user.id, changes);
            setToast({show: true, message: 'Role updated', type: 'success'});
            load();
        } catch (e) {
            setToast({show: true, message: e.message, type: 'error'});
        } finally {
            setUpdatingUserId(null);
        }
    };

    const handleManagePermissions = (user) => {
        console.log('🔍 DEBUG: Opening permission modal for user:', user);
        console.log('🔍 DEBUG: User ID:', user.id);
        console.log('🔍 DEBUG: User email:', user.email);
        console.log('🔍 DEBUG: User roles:', user.roles);
        console.log('🔍 DEBUG: User permissions:', user.permissions);
        setSelectedUser(user);
        setShowPermissionModal(true);
    };

    const handlePermissionSuccess = () => {
        load(); // Refresh the list after permission changes
    };

    const handleManageUser = (user) => {
        console.log('🔍 DEBUG: Opening user management modal for user:', user);
        setSelectedUser(user);
        setShowUserManagement(true);
    };

    const handleUserManagementSuccess = () => {
        load(); // Reload users list
    };

    const createUser = async () => {
        setValidationError('');
        
        if (!createForm.email || !createForm.password || !createForm.confirm_password) {
            setValidationError('Please fill all required fields');
            return;
        }
        if (createForm.password !== createForm.confirm_password) {
            setValidationError('Passwords do not match');
            return;
        }
        if (!createForm.is_staff && !createForm.is_superuser) {
            setValidationError('Please select at least one role (Staff or Superuser)');
            return;
        }

        // Check if email already exists
        try {
            const checkResponse = await fetch(`${API_CONFIG.BASE_URL}/api/accounts/check-email/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({email: createForm.email})
            });
            
            if (checkResponse.ok) {
                const checkData = await checkResponse.json();
                if (checkData.exists) {
                    setEmailError('A user with this email already exists. Please use a different email.');
                    return;
                } else {
                    setEmailError('');
                }
            }
        } catch (e) {
            console.log('Email check failed, proceeding with creation...');
        }

        setCreating(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/accounts/users/create-admin/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: createForm.email,
                    password: createForm.password,
                    full_name: createForm.full_name,
                    is_staff: createForm.is_staff,
                    is_superuser: createForm.is_superuser
                })
            });

            if (response.ok) {
                setToast({show: true, message: 'User created successfully', type: 'success'});
                setShowCreateModal(false);
                setCreateForm({
                    email: '',
                    password: '',
                    confirm_password: '',
                    full_name: '',
                    is_staff: false,
                    is_superuser: false
                });
                setEmailError('');
                setValidationError('');
                load();
            } else {
                const errorData = await response.json();
                console.log('🔍 DEBUG: Backend error response:', errorData);
                if (errorData.errors) {
                    // Handle validation errors
                    const errorMessages = [];
                    if (errorData.errors.email) errorMessages.push(errorData.errors.email[0]);
                    if (errorData.errors.password) errorMessages.push(errorData.errors.password[0]);
                    setToast({show: true, message: errorMessages.join(', '), type: 'error'});
                } else {
                    setToast({show: true, message: errorData.message || 'Failed to create user', type: 'error'});
                }
            }
        } catch (e) {
            setToast({show: true, message: e.message, type: 'error'});
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Admin and Staff</h5>
                <div>
                    <button className="btn btn-sm btn-primary mr-2" onClick={() => setShowCreateModal(true)}>
                        <i className="fa fa-plus mr-1"></i>Create User
                    </button>
                    <button className="btn btn-sm btn-outline-primary" onClick={load} disabled={loading}>
                        {loading ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>
            </div>
            <div className="card-body">
                {toast.show && (
                    <div className={`alert alert-${toast.type === 'error' ? 'danger' : toast.type} alert-dismissible fade show`}>
                        {toast.message}
                        <button type="button" className="close" onClick={() => setToast({show: false, message: '', type: 'success'})}>
                            <span>&times;</span>
                        </button>
                    </div>
                )}

                <div className="table-responsive">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>Email</th>
                                <th>Name</th>
                                <th>Username</th>
                                <th>Staff</th>
                                <th>Superuser</th>
                                <th>Roles</th>
                                <th>Last Login</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="8" className="text-center"><i className="fa fa-spinner fa-spin"></i> Loading...</td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan="8" className="text-center text-muted">No admin/staff users</td></tr>
                            ) : users.map(u => (
                                <tr key={u.id}>
                                    <td>{u.email}</td>
                                    <td>{u.full_name || '-'}</td>
                                    <td>{u.username || '-'}</td>
                                    <td>
                                        <span className={`badge ${u.is_staff ? 'badge-success' : 'badge-secondary'}`}>{u.is_staff ? 'Yes' : 'No'}</span>
                                    </td>
                                    <td>
                                        <span className={`badge ${u.is_superuser ? 'badge-success' : 'badge-secondary'}`}>{u.is_superuser ? 'Yes' : 'No'}</span>
                                    </td>
                                    <td>
                                        <div className="d-flex flex-wrap">
                                            {u.roles && u.roles.length > 0 ? (
                                                u.roles.slice(0, 2).map(role => (
                                                    <span key={role.id} className="badge badge-primary mr-1 mb-1">
                                                        {role.name}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-muted">No roles</span>
                                            )}
                                            {u.roles && u.roles.length > 2 && (
                                                <span className="badge badge-secondary mr-1 mb-1">
                                                    +{u.roles.length - 2}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <span className="text-muted">
                                            {u.last_login_formatted || u.last_login ? 
                                                (u.last_login_formatted || new Date(u.last_login).toLocaleString('en-US', {
                                                    timeZone: 'Asia/Dhaka',
                                                    year: 'numeric',
                                                    month: '2-digit',
                                                    day: '2-digit',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    second: '2-digit',
                                                    hour12: true
                                                })) : 
                                                'Never'
                                            }
                                        </span>
                                    </td>
                                    <td>
                                        <div className="btn-group btn-group-sm" role="group" style={{flexWrap: 'wrap', gap: '2px'}}>
                                            <button 
                                                className={`btn btn-sm ${u.is_staff ? 'btn-outline-danger' : 'btn-outline-success'}`}
                                                onClick={() => updateRole(u, {is_staff: !u.is_staff})}
                                                disabled={updatingUserId === u.id}
                                                title={u.is_staff ? 'Remove Staff Access' : 'Grant Staff Access'}
                                            >
                                                {updatingUserId === u.id ? (
                                                    <i className="fa fa-spinner fa-spin"></i>
                                                ) : (
                                                    <i className={`fa fa-${u.is_staff ? 'ban' : 'user-tie'}`}></i>
                                                )}
                                            </button>
                                            <button 
                                                className={`btn btn-sm ${u.is_superuser ? 'btn-outline-danger' : 'btn-outline-primary'}`}
                                                onClick={() => updateRole(u, {is_superuser: !u.is_superuser})}
                                                disabled={updatingUserId === u.id}
                                                title={u.is_superuser ? 'Remove Admin Access' : 'Grant Admin Access'}
                                            >
                                                {updatingUserId === u.id ? (
                                                    <i className="fa fa-spinner fa-spin"></i>
                                                ) : (
                                                    <i className={`fa fa-${u.is_superuser ? 'times' : 'crown'}`}></i>
                                                )}
                                            </button>
                                            <button 
                                                className="btn btn-sm btn-outline-warning"
                                                onClick={() => handleManagePermissions(u)}
                                                title="Manage Permissions"
                                            >
                                                <i className="fa fa-key"></i>
                                            </button>
                                            <button 
                                                className="btn btn-sm btn-outline-info"
                                                onClick={() => handleManageUser(u)}
                                                title="Manage User Profile & Settings"
                                            >
                                                <i className="fa fa-user-cog"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create User Modal */}
            {showCreateModal && (
                <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Create Admin/Staff User</h5>
                                <button type="button" className="close" onClick={() => setShowCreateModal(false)}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                {validationError && (
                                    <div className="alert alert-danger">
                                        <i className="fa fa-exclamation-triangle mr-2"></i>
                                        {validationError}
                                    </div>
                                )}
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label>Email *</label>
                                            <input
                                                type="email"
                                                className={`form-control ${emailError ? 'is-invalid' : ''}`}
                                                value={createForm.email}
                                                onChange={(e) => {
                                                    setCreateForm({...createForm, email: e.target.value});
                                                    setEmailError(''); // Clear error when typing
                                                }}
                                                placeholder="user@example.com"
                                            />
                                            {emailError && (
                                                <div className="invalid-feedback">
                                                    {emailError}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label>Full Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={createForm.full_name}
                                                onChange={(e) => setCreateForm({...createForm, full_name: e.target.value})}
                                                placeholder="John Doe"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label className="d-flex justify-content-between align-items-center">
                                                <span>Password *</span>
                                                <small className="text-muted">Password must be at least 6 characters</small>
                                            </label>
                                            <div className="input-group">
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    className="form-control"
                                                    value={createForm.password}
                                                    onChange={(e) => setCreateForm({...createForm, password: e.target.value})}
                                                    placeholder="Enter password"
                                                />
                                                <div className="input-group-append">
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-secondary"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                    >
                                                        <i className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label>Confirm Password *</label>
                                            <div className="input-group">
                                                <input
                                                    type={showConfirmPassword ? 'text' : 'password'}
                                                    className="form-control"
                                                    value={createForm.confirm_password}
                                                    onChange={(e) => setCreateForm({...createForm, confirm_password: e.target.value})}
                                                    placeholder="Confirm password"
                                                />
                                                <div className="input-group-append">
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-secondary"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    >
                                                        <i className={`fa ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="form-group">
                                            <label>User Roles *</label>
                                            <div className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id="is_staff"
                                                    checked={createForm.is_staff}
                                                    onChange={(e) => setCreateForm({...createForm, is_staff: e.target.checked})}
                                                />
                                                <label className="form-check-label" htmlFor="is_staff">
                                                    Staff (Can access admin panel)
                                                </label>
                                            </div>
                                            <div className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id="is_superuser"
                                                    checked={createForm.is_superuser}
                                                    onChange={(e) => setCreateForm({...createForm, is_superuser: e.target.checked})}
                                                />
                                                <label className="form-check-label" htmlFor="is_superuser">
                                                    Superuser (Full admin access)
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                                    Cancel
                                </button>
                                <button type="button" className="btn btn-primary" onClick={createUser} disabled={creating}>
                                    {creating ? (
                                        <>
                                            <i className="fa fa-spinner fa-spin mr-1"></i>Creating...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa fa-plus mr-1"></i>Create User
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Permission Assignment Modal */}
            {showPermissionModal && selectedUser && (
                <UserPermissionAssignment
                    user={selectedUser}
                    onClose={() => {
                        setShowPermissionModal(false);
                        setSelectedUser(null);
                    }}
                    onSuccess={handlePermissionSuccess}
                />
            )}

            {/* User Management Modal */}
            {showUserManagement && selectedUser && (
                <AdminUserManagement
                    user={selectedUser}
                    onClose={() => {
                        setShowUserManagement(false);
                        setSelectedUser(null);
                    }}
                    onSuccess={handleUserManagementSuccess}
                />
            )}
        </div>
    );
};

export default AdminStaffManager;


