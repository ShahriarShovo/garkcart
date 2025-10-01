import React, { useState, useEffect } from 'react';
import permissionApi from './api/permissionApi';

const PermissionManagement = () => {
    const [activeTab, setActiveTab] = useState('permissions');
    const [permissions, setPermissions] = useState([]);
    const [roles, setRoles] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
    };

    const loadPermissions = async () => {
        setLoading(true);
        try {
            const data = await permissionApi.getPermissions();
            console.log('🔍 DEBUG: Permissions response:', data);
            const permissions = data.data || data || [];
            setPermissions(permissions);
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadRoles = async () => {
        setLoading(true);
        try {
            const data = await permissionApi.getRoles();
            console.log('🔍 DEBUG: Roles response:', data);
            const roles = data.data || data || [];
            setRoles(roles);
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadUsers = async () => {
        setLoading(true);
        try {
            const data = await permissionApi.getUserPermissions();
            console.log('🔍 DEBUG: Users response:', data);
            const users = data.data || data || [];
            setUsers(users);
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const createDefaultPermissions = async () => {
        try {
            const data = await permissionApi.createDefaultPermissions();
            showToast(data.message, 'success');
            loadPermissions();
        } catch (error) {
            showToast(error.message, 'error');
        }
    };

    useEffect(() => {
        if (activeTab === 'permissions') {
            loadPermissions();
        } else if (activeTab === 'roles') {
            loadRoles();
        } else if (activeTab === 'users') {
            loadUsers();
        }
    }, [activeTab]);

    // Auto-create default permissions and roles on first load
    useEffect(() => {
        const initializeDefaults = async () => {
            try {
                console.log('🔍 DEBUG: Creating default permissions and roles...');
                const result = await permissionApi.createDefaultPermissions();
                console.log('🔍 DEBUG: Create result:', result);
                
                // Refresh data after creating defaults
                if (activeTab === 'permissions') {
                    loadPermissions();
                } else if (activeTab === 'roles') {
                    loadRoles();
                }
            } catch (error) {
                console.log('🔍 DEBUG: Error creating defaults:', error);
                // Ignore error if already exists
                console.log('Default permissions/roles may already exist');
            }
        };
        
        initializeDefaults();
    }, []);

    return (
        <div className="card">
            <div className="card-header">
                <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                        <i className="fa fa-shield-alt mr-2"></i>
                        Permission Management
                    </h5>
                    <div className="btn-group" role="group">
                        <button
                            className={`btn btn-sm ${activeTab === 'permissions' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setActiveTab('permissions')}
                        >
                            <i className="fa fa-key mr-1"></i>Permissions
                        </button>
                        <button
                            className={`btn btn-sm ${activeTab === 'roles' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setActiveTab('roles')}
                        >
                            <i className="fa fa-users-cog mr-1"></i>Roles
                        </button>
                        <button
                            className={`btn btn-sm ${activeTab === 'users' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setActiveTab('users')}
                        >
                            <i className="fa fa-user-shield mr-1"></i>User Permissions
                        </button>
                    </div>
                </div>
            </div>

            <div className="card-body">
                {toast.show && (
                    <div className={`alert alert-${toast.type === 'error' ? 'danger' : toast.type} alert-dismissible fade show`}>
                        {toast.message}
                        <button type="button" className="close" onClick={() => setToast({ show: false, message: '', type: 'success' })}>
                            <span>&times;</span>
                        </button>
                    </div>
                )}

                {/* Permissions Tab */}
                {activeTab === 'permissions' && (
                    <div>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6>System Permissions</h6>
                            <div>
                                <button className="btn btn-sm btn-success mr-2" onClick={createDefaultPermissions}>
                                    <i className="fa fa-plus mr-1"></i>Create Default Permissions
                                </button>
                                <button className="btn btn-sm btn-info" onClick={loadPermissions}>
                                    <i className="fa fa-refresh mr-1"></i>Refresh
                                </button>
                            </div>
                        </div>
                        {loading ? (
                            <div className="text-center py-4">
                                <i className="fa fa-spinner fa-spin fa-2x text-primary"></i>
                                <p className="mt-2">Loading permissions...</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Code</th>
                                            <th>Category</th>
                                            <th>Description</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {permissions.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="text-center text-muted">No permissions found</td>
                                            </tr>
                                        ) : (
                                            permissions.map(permission => (
                                                <tr key={permission.id}>
                                                    <td>{permission.name}</td>
                                                    <td><code>{permission.codename}</code></td>
                                                    <td>
                                                        <span className="badge badge-info">{permission.category}</span>
                                                    </td>
                                                    <td>{permission.description || '-'}</td>
                                                    <td>
                                                        <span className={`badge ${permission.is_active ? 'badge-success' : 'badge-secondary'}`}>
                                                            {permission.is_active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Roles Tab */}
                {activeTab === 'roles' && (
                    <div>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6>User Roles</h6>
                            <div>
                                <button className="btn btn-sm btn-primary mr-2">
                                    <i className="fa fa-plus mr-1"></i>Create Role
                                </button>
                                <button className="btn btn-sm btn-info" onClick={loadRoles}>
                                    <i className="fa fa-refresh mr-1"></i>Refresh
                                </button>
                            </div>
                        </div>
                        {loading ? (
                            <div className="text-center py-4">
                                <i className="fa fa-spinner fa-spin fa-2x text-primary"></i>
                                <p className="mt-2">Loading roles...</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Description</th>
                                            <th>Permissions</th>
                                            <th>Users</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {roles.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="text-center text-muted">No roles found</td>
                                            </tr>
                                        ) : (
                                            roles.map(role => (
                                                <tr key={role.id}>
                                                    <td>
                                                        <strong>{role.name}</strong>
                                                        {role.is_system_role && (
                                                            <span className="badge badge-warning ml-2">System</span>
                                                        )}
                                                    </td>
                                                    <td>{role.description || '-'}</td>
                                                    <td>
                                                        <span className="badge badge-primary">{role.permission_count}</span>
                                                    </td>
                                                    <td>
                                                        <span className="badge badge-info">{role.user_count}</span>
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${role.is_active ? 'badge-success' : 'badge-secondary'}`}>
                                                            {role.is_active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="btn-group btn-group-sm">
                                                            <button className="btn btn-outline-info" title="View Details">
                                                                <i className="fa fa-eye"></i>
                                                            </button>
                                                            <button className="btn btn-outline-warning" title="Edit">
                                                                <i className="fa fa-edit"></i>
                                                            </button>
                                                            {!role.is_system_role && (
                                                                <button className="btn btn-outline-danger" title="Delete">
                                                                    <i className="fa fa-trash"></i>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* User Permissions Tab */}
                {activeTab === 'users' && (
                    <div>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6>User Permissions</h6>
                            <button className="btn btn-sm btn-primary">
                                <i className="fa fa-user-plus mr-1"></i>Assign Permissions
                            </button>
                        </div>
                        {loading ? (
                            <div className="text-center py-4">
                                <i className="fa fa-spinner fa-spin fa-2x text-primary"></i>
                                <p className="mt-2">Loading users...</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>User</th>
                                            <th>Email</th>
                                            <th>Roles</th>
                                            <th>Permissions</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="text-center text-muted">No users found</td>
                                            </tr>
                                        ) : (
                                            users.map(user => (
                                                <tr key={user.id}>
                                                    <td>
                                                        <strong>{user.full_name || 'N/A'}</strong>
                                                        <br />
                                                        <small className="text-muted">
                                                            {user.is_superuser && <span className="badge badge-danger mr-1">Superuser</span>}
                                                            {user.is_staff && <span className="badge badge-warning">Staff</span>}
                                                        </small>
                                                    </td>
                                                    <td>{user.email}</td>
                                                    <td>
                                                        {user.roles.length > 0 ? (
                                                            user.roles.map(role => (
                                                                <span key={role.id} className="badge badge-info mr-1">{role.name}</span>
                                                            ))
                                                        ) : (
                                                            <span className="text-muted">No roles</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <span className="badge badge-success">{user.permissions.length} permissions</span>
                                                    </td>
                                                    <td>
                                                        <button className="btn btn-sm btn-outline-primary" title="Manage Permissions">
                                                            <i className="fa fa-cog"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PermissionManagement;
