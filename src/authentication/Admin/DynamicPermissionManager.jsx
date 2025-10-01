import React, { useState, useEffect } from 'react';
import permissionApi from './api/permissionApi';
import DynamicPermissionTest from './DynamicPermissionTest';

const DynamicPermissionManager = () => {
    const [permissions, setPermissions] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    
    // Permission creation states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [permissionForm, setPermissionForm] = useState({
        name: '',
        codename: '',
        description: '',
        category: 'general'
    });
    
    // User permission assignment states
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedPermissions, setSelectedPermissions] = useState([]);
    

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
    };

    const loadPermissions = async () => {
        setLoading(true);
        try {
            const data = await permissionApi.getPermissions();
            setPermissions(data.data || data || []);
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
            setUsers(data.data || data || []);
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePermission = async () => {
        try {
            const data = await permissionApi.createPermission(permissionForm);
            showToast('Permission created successfully', 'success');
            setShowCreateModal(false);
            setPermissionForm({ name: '', codename: '', description: '', category: 'general' });
            loadPermissions();
        } catch (error) {
            showToast(error.message, 'error');
        }
    };

    const handleAssignPermissions = async () => {
        try {
            const data = await permissionApi.assignUserPermissions(
                selectedUser.id,
                selectedPermissions,
                []
            );
            showToast('Permissions assigned successfully', 'success');
            setShowAssignModal(false);
            setSelectedUser(null);
            setSelectedPermissions([]);
            loadUsers();
        } catch (error) {
            showToast(error.message, 'error');
        }
    };


    useEffect(() => {
        loadPermissions();
        loadUsers();
    }, []);

    return (
        <div className="card">
            <div className="card-header">
                <h5 className="mb-0">
                    <i className="fa fa-magic mr-2"></i>
                    Dynamic Permission Manager
                </h5>
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

                {/* Action Buttons */}
                <div className="row mb-4">
                    <div className="col-md-4">
                        <button 
                            className="btn btn-primary btn-block"
                            onClick={() => setShowCreateModal(true)}
                        >
                            <i className="fa fa-plus mr-2"></i>Create New Permission
                        </button>
                    </div>
                    <div className="col-md-4">
                        <button 
                            className="btn btn-success btn-block"
                            onClick={() => setShowAssignModal(true)}
                        >
                            <i className="fa fa-user-plus mr-2"></i>Assign Permissions to User
                        </button>
                    </div>
                    <div className="col-md-4">
                        <button 
                            className="btn btn-info btn-block"
                            onClick={loadPermissions}
                        >
                            <i className="fa fa-refresh mr-2"></i>Refresh Data
                        </button>
                    </div>
                </div>

                {/* Permission Testing Section */}
                <DynamicPermissionTest />

                {/* Permissions List */}
                <div className="card">
                    <div className="card-header">
                        <h6 className="mb-0">Available Permissions</h6>
                    </div>
                    <div className="card-body">
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
                                            <th>Code Name</th>
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
                </div>
            </div>

            {/* Create Permission Modal */}
            {showCreateModal && (
                <div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Create New Permission</h5>
                                <button 
                                    type="button" 
                                    className="close" 
                                    onClick={() => {
                                        setShowCreateModal(false);
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
                                            placeholder="e.g., Custom Feature Access"
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
                                            placeholder="e.g., custom_feature_access"
                                            required
                                        />
                                        <small className="form-text text-muted">
                                            Use lowercase with underscores. This will be used in code.
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
                                            <option value="custom">Custom</option>
                                            <option value="feature">Feature</option>
                                            <option value="module">Module</option>
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
                                        setShowCreateModal(false);
                                        setPermissionForm({ name: '', codename: '', description: '', category: 'general' });
                                    }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-primary"
                                    onClick={handleCreatePermission}
                                    disabled={!permissionForm.name || !permissionForm.codename}
                                >
                                    Create Permission
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Assign Permissions Modal */}
            {showAssignModal && (
                <div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Assign Permissions to User</h5>
                                <button 
                                    type="button" 
                                    className="close" 
                                    onClick={() => {
                                        setShowAssignModal(false);
                                        setSelectedUser(null);
                                        setSelectedPermissions([]);
                                    }}
                                >
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Select User</label>
                                    <select
                                        className="form-control"
                                        value={selectedUser?.id || ''}
                                        onChange={(e) => {
                                            const userId = parseInt(e.target.value);
                                            const user = users.find(u => u.id === userId);
                                            setSelectedUser(user);
                                            setSelectedPermissions(user?.permissions || []);
                                        }}
                                    >
                                        <option value="">Choose a user...</option>
                                        {users.map(user => (
                                            <option key={user.id} value={user.id}>
                                                {user.full_name || 'N/A'} ({user.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                {selectedUser && (
                                    <div className="form-group">
                                        <label>Select Permissions</label>
                                        <div className="row">
                                            {permissions.map(permission => (
                                                <div key={permission.id} className="col-md-6 mb-2">
                                                    <div className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            id={`perm_${permission.id}`}
                                                            checked={selectedPermissions.includes(permission.id)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setSelectedPermissions([...selectedPermissions, permission.id]);
                                                                } else {
                                                                    setSelectedPermissions(selectedPermissions.filter(id => id !== permission.id));
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
                                )}
                            </div>
                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary" 
                                    onClick={() => {
                                        setShowAssignModal(false);
                                        setSelectedUser(null);
                                        setSelectedPermissions([]);
                                    }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-primary"
                                    onClick={handleAssignPermissions}
                                    disabled={!selectedUser}
                                >
                                    Assign Permissions
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DynamicPermissionManager;
