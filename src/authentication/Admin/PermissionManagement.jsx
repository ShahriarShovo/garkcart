import React, { useState, useEffect } from 'react';
import permissionApi from './api/permissionApi';

const PermissionManagement = () => {
    const [activeTab, setActiveTab] = useState('permissions');
    const [permissions, setPermissions] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    // Role view modal state
    const [showRoleViewModal, setShowRoleViewModal] = useState(false);
    const [roleViewData, setRoleViewData] = useState({ role: null, permissions: [] });
    
    // Permission CRUD states
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [editingPermission, setEditingPermission] = useState(null);
    const [permissionForm, setPermissionForm] = useState({
        name: '',
        codename: '',
        description: '',
        category: 'general'
    });
    
    // Role management states
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [roleForm, setRoleForm] = useState({
        name: '',
        description: '',
        permissions: []
    });
    

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


    const createDefaultPermissions = async () => {
        try {
            const data = await permissionApi.createDefaultPermissions();
            showToast(data.message, 'success');
            loadPermissions();
        } catch (error) {
            showToast(error.message, 'error');
        }
    };

    // Permission CRUD functions
    const handleCreatePermission = async () => {
        try {
            const data = await permissionApi.createPermission(permissionForm);
            showToast('Permission created successfully', 'success');
            setShowPermissionModal(false);
            setPermissionForm({ name: '', codename: '', description: '', category: 'general' });
            loadPermissions();
        } catch (error) {
            showToast(error.message, 'error');
        }
    };

    const handleUpdatePermission = async () => {
        try {
            const data = await permissionApi.updatePermission(editingPermission.id, permissionForm);
            showToast('Permission updated successfully', 'success');
            setShowPermissionModal(false);
            setEditingPermission(null);
            setPermissionForm({ name: '', codename: '', description: '', category: 'general' });
            loadPermissions();
        } catch (error) {
            showToast(error.message, 'error');
        }
    };

    const handleDeletePermission = async (permission) => {
        if (window.confirm(`Are you sure you want to delete "${permission.name}"?`)) {
            try {
                await permissionApi.deletePermission(permission.id);
                showToast('Permission deleted successfully', 'success');
                loadPermissions();
            } catch (error) {
                showToast(error.message, 'error');
            }
        }
    };

    const handleEditPermission = (permission) => {
        setEditingPermission(permission);
        setPermissionForm({
            name: permission.name,
            codename: permission.codename,
            description: permission.description || '',
            category: permission.category
        });
        setShowPermissionModal(true);
    };

    // Role management functions
    const handleCreateRole = async () => {
        try {
            const data = await permissionApi.createRole(roleForm);
            showToast('Role created successfully', 'success');
            setShowRoleModal(false);
            setRoleForm({ name: '', description: '', permissions: [] });
            loadRoles();
        } catch (error) {
            showToast(error.message, 'error');
        }
    };

    const handleUpdateRole = async () => {
        try {
            const data = await permissionApi.updateRole(editingRole.id, roleForm);
            showToast('Role updated successfully', 'success');
            setShowRoleModal(false);
            setEditingRole(null);
            setRoleForm({ name: '', description: '', permissions: [] });
            loadRoles();
        } catch (error) {
            showToast(error.message, 'error');
        }
    };

    const handleDeleteRole = async (role) => {
        if (role.is_system_role) {
            showToast('Cannot delete system roles', 'error');
            return;
        }
        if (window.confirm(`Are you sure you want to delete "${role.name}"?`)) {
            try {
                await permissionApi.deleteRole(role.id);
                showToast('Role deleted successfully', 'success');
                loadRoles();
            } catch (error) {
                showToast(error.message, 'error');
            }
        }
    };

    const handleViewRole = async (role) => {
        try {
            const roleDetails = await permissionApi.getRolePermissions(role.id);
            const permissions = roleDetails.data || roleDetails || [];
            setRoleViewData({ role, permissions });
            setShowRoleViewModal(true);
        } catch (error) {
            console.error('Error loading role details:', error);
            showToast('Failed to load role details', 'error');
        }
    };

    const handleEditRole = (role) => {
        setEditingRole(role);
        setRoleForm({
            name: role.name,
            description: role.description || '',
            permissions: role.permissions || []
        });
        setShowRoleModal(true);
    };


    useEffect(() => {
        if (activeTab === 'permissions') {
            loadPermissions();
        } else if (activeTab === 'roles') {
            loadRoles();
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
                                <button className="btn btn-sm btn-primary mr-2" onClick={() => setShowPermissionModal(true)}>
                                    <i className="fa fa-plus mr-1"></i>Create Permission
                                </button>
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
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {permissions.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="text-center text-muted">No permissions found</td>
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
                                                    <td>
                                                        <div className="btn-group btn-group-sm">
                                                            <button 
                                                                className="btn btn-outline-info" 
                                                                onClick={() => handleEditPermission(permission)}
                                                                title="Edit Permission"
                                                            >
                                                                <i className="fa fa-edit"></i>
                                                            </button>
                                                            <button 
                                                                className="btn btn-outline-danger" 
                                                                onClick={() => handleDeletePermission(permission)}
                                                                title="Delete Permission"
                                                            >
                                                                <i className="fa fa-trash"></i>
                                                            </button>
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

                {/* Roles Tab */}
                {activeTab === 'roles' && (
                    <div>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6>User Roles</h6>
                            <div>
                                <button className="btn btn-sm btn-primary mr-2" onClick={() => setShowRoleModal(true)}>
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
                                                            <button 
                                                                className="btn btn-outline-info" 
                                                                title="View Details"
                                                                onClick={() => handleViewRole(role)}
                                                            >
                                                                <i className="fa fa-eye"></i>
                                                            </button>
                                                            <button 
                                                                className="btn btn-outline-warning" 
                                                                title="Edit"
                                                                onClick={() => handleEditRole(role)}
                                                            >
                                                                <i className="fa fa-edit"></i>
                                                            </button>
                                                            {!role.is_system_role && (
                                                                <button 
                                                                    className="btn btn-outline-danger" 
                                                                    title="Delete"
                                                                    onClick={() => handleDeleteRole(role)}
                                                                >
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

            </div>

            {/* Permission Create/Edit Modal */}
            {showPermissionModal && (
                <div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {editingPermission ? 'Edit Permission' : 'Create New Permission'}
                                </h5>
                                <button 
                                    type="button" 
                                    className="close" 
                                    onClick={() => {
                                        setShowPermissionModal(false);
                                        setEditingPermission(null);
                                        setPermissionForm({ name: '', codename: '', description: '', category: 'general' });
                                    }}
                                >
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <form>
                                    <div className="form-group">
                                        <label htmlFor="permissionName">Permission Name *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="permissionName"
                                            value={permissionForm.name}
                                            onChange={(e) => setPermissionForm({...permissionForm, name: e.target.value})}
                                            placeholder="e.g., Manage Products"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="permissionCodename">Code Name *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="permissionCodename"
                                            value={permissionForm.codename}
                                            onChange={(e) => setPermissionForm({...permissionForm, codename: e.target.value})}
                                            placeholder="e.g., manage_products"
                                            required
                                        />
                                        <small className="form-text text-muted">
                                            Use lowercase with underscores (e.g., manage_products)
                                        </small>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="permissionCategory">Category</label>
                                        <select
                                            className="form-control"
                                            id="permissionCategory"
                                            value={permissionForm.category}
                                            onChange={(e) => setPermissionForm({...permissionForm, category: e.target.value})}
                                        >
                                            <option value="general">General</option>
                                            <option value="dashboard">Dashboard</option>
                                            <option value="products">Products</option>
                                            <option value="orders">Orders</option>
                                            <option value="users">Users</option>
                                            <option value="communication">Communication</option>
                                            <option value="reports">Reports</option>
                                            <option value="settings">Settings</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="permissionDescription">Description</label>
                                        <textarea
                                            className="form-control"
                                            id="permissionDescription"
                                            rows="3"
                                            value={permissionForm.description}
                                            onChange={(e) => setPermissionForm({...permissionForm, description: e.target.value})}
                                            placeholder="Describe what this permission allows users to do"
                                        />
                                    </div>
                                </form>
                            </div>
                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary" 
                                    onClick={() => {
                                        setShowPermissionModal(false);
                                        setEditingPermission(null);
                                        setPermissionForm({ name: '', codename: '', description: '', category: 'general' });
                                    }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-primary"
                                    onClick={editingPermission ? handleUpdatePermission : handleCreatePermission}
                                    disabled={!permissionForm.name || !permissionForm.codename}
                                >
                                    {editingPermission ? 'Update Permission' : 'Create Permission'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Role Create/Edit Modal */}
            {showRoleModal && (
                <div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="modal-dialog modal-lg" style={{maxHeight: '90vh', marginTop: '5vh'}}>
                        <div className="modal-content" style={{maxHeight: '90vh', display: 'flex', flexDirection: 'column'}}>
                            <div className="modal-header" style={{flexShrink: 0}}>
                                <h5 className="modal-title">
                                    {editingRole ? 'Edit Role' : 'Create New Role'}
                                </h5>
                                <button 
                                    type="button" 
                                    className="close" 
                                    onClick={() => {
                                        setShowRoleModal(false);
                                        setEditingRole(null);
                                        setRoleForm({ name: '', description: '', permissions: [] });
                                    }}
                                >
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body" style={{flex: 1, overflowY: 'auto', maxHeight: '60vh'}}>
                                <form>
                                    <div className="form-group">
                                        <label htmlFor="roleName">Role Name *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="roleName"
                                            value={roleForm.name}
                                            onChange={(e) => setRoleForm({...roleForm, name: e.target.value})}
                                            placeholder="e.g., Product Manager"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="roleDescription">Description</label>
                                        <textarea
                                            className="form-control"
                                            id="roleDescription"
                                            rows="3"
                                            value={roleForm.description}
                                            onChange={(e) => setRoleForm({...roleForm, description: e.target.value})}
                                            placeholder="Describe the responsibilities of this role"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Permissions</label>
                                        <div className="row" style={{maxHeight: '40vh', overflowY: 'auto'}}>
                                            {permissions.map(permission => (
                                                <div key={permission.id} className="col-md-6 mb-2">
                                                    <div className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            id={`perm_${permission.id}`}
                                                            checked={roleForm.permissions.includes(permission.id)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setRoleForm({
                                                                        ...roleForm,
                                                                        permissions: [...roleForm.permissions, permission.id]
                                                                    });
                                                                } else {
                                                                    setRoleForm({
                                                                        ...roleForm,
                                                                        permissions: roleForm.permissions.filter(id => id !== permission.id)
                                                                    });
                                                                }
                                                            }}
                                                        />
                                                        <label className="form-check-label" htmlFor={`perm_${permission.id}`}>
                                                            {permission.name}
                                                            <small className="text-muted d-block">{permission.codename}</small>
                                                        </label>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div className="modal-footer" style={{flexShrink: 0, borderTop: '1px solid #dee2e6'}}>
                                <button 
                                    type="button" 
                                    className="btn btn-secondary" 
                                    onClick={() => {
                                        setShowRoleModal(false);
                                        setEditingRole(null);
                                        setRoleForm({ name: '', description: '', permissions: [] });
                                    }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-primary"
                                    onClick={editingRole ? handleUpdateRole : handleCreateRole}
                                    disabled={!roleForm.name}
                                >
                                    {editingRole ? 'Update Role' : 'Create Role'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Role View Details Modal */}
            {showRoleViewModal && (
                <div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="fa fa-eye mr-2"></i>
                                    {roleViewData.role ? roleViewData.role.name : 'Role Details'}
                                </h5>
                                <button 
                                    type="button" 
                                    className="close" 
                                    onClick={() => setShowRoleViewModal(false)}
                                >
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body" style={{maxHeight: '70vh', overflowY: 'auto'}}>
                                {roleViewData.role && (
                                    <div>
                                        <div className="mb-3">
                                            <strong>Description:</strong>
                                            <div className="text-muted">{roleViewData.role.description || 'No description'}</div>
                                        </div>
                                        <div>
                                            <strong>Permissions ({roleViewData.permissions.length}):</strong>
                                            {roleViewData.permissions.length === 0 ? (
                                                <div className="text-muted mt-2">No permissions assigned</div>
                                            ) : (
                                                <div className="row mt-2">
                                                    {roleViewData.permissions.map(perm => (
                                                        <div key={perm.id} className="col-md-6 mb-2">
                                                            <div className="border rounded p-2">
                                                                <div className="d-flex align-items-center justify-content-between">
                                                                    <span>{perm.name}</span>
                                                                    <span className="badge badge-light text-muted">{perm.category}</span>
                                                                </div>
                                                                <small className="text-muted">{perm.codename}</small>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary" 
                                    onClick={() => setShowRoleViewModal(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default PermissionManagement;
