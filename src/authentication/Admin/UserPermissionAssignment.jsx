import React, { useState, useEffect } from 'react';
import permissionApi from './api/permissionApi';

const UserPermissionAssignment = ({ user, onClose, onSuccess }) => {
    const [permissions, setPermissions] = useState([]);
    const [roles, setRoles] = useState([]);
    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const [permissionsData, rolesData] = await Promise.all([
                permissionApi.getPermissions(),
                permissionApi.getRoles()
            ]);
            
            console.log('🔍 DEBUG: Permissions data:', permissionsData);
            console.log('🔍 DEBUG: Roles data:', rolesData);
            
            // Handle different response structures
            const allPermissions = permissionsData.data || permissionsData || [];
            const roles = rolesData.data || rolesData || [];
            
            // Filter out live_chat_access permission
            const permissions = allPermissions.filter(permission => permission.codename !== 'live_chat_access');
            
            setPermissions(permissions);
            setRoles(roles);
            
            // Set current user permissions and roles
            console.log('🔍 DEBUG: Setting current user permissions and roles...');
            console.log('🔍 DEBUG: User permissions from props:', user.permissions);
            console.log('🔍 DEBUG: User roles from props:', user.roles);
            
            if (user.permissions) {
                // Convert permission codenames to IDs and filter out live_chat_access
                const permissionIds = user.permissions.map(p => {
                    if (typeof p === 'string') {
                        // Skip live_chat_access permission
                        if (p === 'live_chat_access') {
                            return null;
                        }
                        // If it's a codename, find the corresponding permission ID
                        const permission = permissions.find(perm => perm.codename === p);
                        return permission ? permission.id : null;
                    }
                    return p.id || p;
                }).filter(id => id !== null);
                
                console.log('🔍 DEBUG: User permissions (original):', user.permissions);
                console.log('🔍 DEBUG: Converted permission IDs:', permissionIds);
                setSelectedPermissions(permissionIds);
            }
            if (user.roles) {
                const roleIds = user.roles.map(r => r.id);
                console.log('🔍 DEBUG: Setting selected roles:', roleIds);
                setSelectedRoles(roleIds);
            }
        } catch (error) {
            console.error('🔍 DEBUG: Error loading data:', error);
            showToast(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [user]);

    const handlePermissionToggle = (permissionId) => {
        console.log('🔍 DEBUG: Toggling permission:', permissionId);
        console.log('🔍 DEBUG: Current selected permissions:', selectedPermissions);
        setSelectedPermissions(prev => 
            prev.includes(permissionId) 
                ? prev.filter(id => id !== permissionId)
                : [...prev, permissionId]
        );
    };

    const handleRoleToggle = (roleId) => {
        setSelectedRoles(prev => 
            prev.includes(roleId) 
                ? prev.filter(id => id !== roleId)
                : [...prev, roleId]
        );
    };

    const handleSave = async () => {
        console.log('🔍 DEBUG: Starting save process...');
        console.log('🔍 DEBUG: User ID:', user.id);
        console.log('🔍 DEBUG: Selected Roles:', selectedRoles);
        console.log('🔍 DEBUG: Selected Permissions:', selectedPermissions);
        console.log('🔍 DEBUG: Roles data:', roles);
        console.log('🔍 DEBUG: Permissions data:', permissions);
        
        setSaving(true);
        
        // Show loading message
        showToast('Saving permissions...', 'success');
        try {
            // Validate and clean data before sending
            const validPermissionIds = selectedPermissions.filter(id => 
                typeof id === 'number' && !isNaN(id)
            );
            const validRoleIds = selectedRoles.filter(id => 
                typeof id === 'number' && !isNaN(id)
            );
            
            console.log('🔍 DEBUG: Original selected permissions:', selectedPermissions);
            console.log('🔍 DEBUG: Valid permission IDs:', validPermissionIds);
            console.log('🔍 DEBUG: Original selected roles:', selectedRoles);
            console.log('🔍 DEBUG: Valid role IDs:', validRoleIds);
            
            console.log('🔍 DEBUG: Calling API with data:', {
                user_id: user.id,
                permission_ids: validPermissionIds,
                role_ids: validRoleIds
            });
            
            const result = await permissionApi.assignUserPermissions(
                user.id,
                validPermissionIds,
                validRoleIds
            );
            
            console.log('🔍 DEBUG: API Response:', result);
            console.log('🔍 DEBUG: Save successful!');
            
            // Show detailed success message
            const roleNames = roles.filter(r => selectedRoles.includes(r.id)).map(r => r.name);
            const permissionNames = permissions.filter(p => selectedPermissions.includes(p.id)).map(p => p.name);
            
            console.log('🔍 DEBUG: Role names to show:', roleNames);
            console.log('🔍 DEBUG: Permission names to show:', permissionNames);
            
            showToast(
                `Permissions updated successfully! Roles: ${roleNames.join(', ')} | Direct Permissions: ${permissionNames.length}`, 
                'success'
            );
            
            console.log('🔍 DEBUG: Calling onSuccess and onClose...');
            onSuccess();
            
            // Show toast for 2 seconds before closing modal
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (error) {
            console.error('🔍 DEBUG: Save error details:', error);
            console.error('🔍 DEBUG: Error message:', error.message);
            console.error('🔍 DEBUG: Error stack:', error.stack);
            
            // Show user-friendly error message
            const errorMessage = error.message || 'Failed to save permissions. Please try again.';
            showToast(`Error: ${errorMessage}`, 'error');
        } finally {
            console.log('🔍 DEBUG: Save process completed');
            setSaving(false);
        }
    };

    const groupedPermissions = permissions.reduce((acc, permission) => {
        if (!acc[permission.category]) {
            acc[permission.category] = [];
        }
        acc[permission.category].push(permission);
        return acc;
    }, {});

    return (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog modal-xl" style={{maxWidth: '95vw', maxHeight: '95vh'}}>
                <div className="modal-content" style={{maxHeight: '95vh', display: 'flex', flexDirection: 'column', borderRadius: '8px'}}>
                    <div className="modal-header" style={{backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6'}}>
                        <h5 className="modal-title" style={{fontWeight: '600', color: '#495057'}}>
                            <i className="fa fa-user-shield mr-2" style={{color: '#007bff'}}></i>
                            Assign Permissions - {user.full_name || user.email}
                        </h5>
                        <button type="button" className="close" onClick={onClose} style={{fontSize: '1.5rem'}}>
                            <span>&times;</span>
                        </button>
                    </div>

                    <div className="modal-body" style={{overflowY: 'auto', flex: 1, padding: '20px'}}>
                        {toast.show && (
                            <div className={`alert alert-${toast.type === 'error' ? 'danger' : 'success'} alert-dismissible fade show`} 
                                 style={{
                                     position: 'sticky',
                                     top: '0',
                                     zIndex: 1050,
                                     marginBottom: '20px',
                                     fontSize: '14px',
                                     fontWeight: '500'
                                 }}>
                                <i className={`fa ${toast.type === 'error' ? 'fa-exclamation-triangle' : 'fa-check-circle'} mr-2`}></i>
                                {toast.message}
                                <button type="button" className="close" onClick={() => setToast({ show: false, message: '', type: 'success' })}>
                                    <span>&times;</span>
                                </button>
                            </div>
                        )}

                        {/* Summary Section */}
                        <div className="card mb-4" style={{border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
                            <div className="card-header" style={{backgroundColor: '#e9ecef', borderBottom: '1px solid #dee2e6'}}>
                                <h6 className="mb-0" style={{color: '#495057', fontWeight: '600'}}>
                                    <i className="fa fa-info-circle mr-2" style={{color: '#007bff'}}></i>
                                    Current Selection Summary
                                </h6>
                            </div>
                            <div className="card-body" style={{backgroundColor: '#fff'}}>
                                <div className="row">
                                    <div className="col-md-6">
                                        <h6 className="text-primary mb-3" style={{fontWeight: '600'}}>
                                            <i className="fa fa-users-cog mr-2"></i>
                                            Selected Roles ({selectedRoles.length})
                                        </h6>
                                        {selectedRoles.length > 0 ? (
                                            <div className="d-flex flex-wrap">
                                                {selectedRoles.map(roleId => {
                                                    const role = roles.find(r => r.id === roleId);
                                                    return role ? (
                                                        <span key={roleId} className="badge badge-primary mr-2 mb-2" style={{fontSize: '12px', padding: '6px 12px'}}>
                                                            {role.name}
                                                        </span>
                                                    ) : null;
                                                })}
                                            </div>
                                        ) : (
                                            <span className="text-muted">No roles selected</span>
                                        )}
                                    </div>
                                    <div className="col-md-6">
                                        <h6 className="text-success mb-3" style={{fontWeight: '600'}}>
                                            <i className="fa fa-key mr-2"></i>
                                            Direct Permissions ({selectedPermissions.length})
                                        </h6>
                                        {selectedPermissions.length > 0 ? (
                                            <div className="d-flex flex-wrap">
                                                {selectedPermissions.slice(0, 3).map(permId => {
                                                    const permission = permissions.find(p => p.id === permId);
                                                    return permission ? (
                                                        <span key={permId} className="badge badge-success mr-2 mb-2" style={{fontSize: '12px', padding: '6px 12px'}}>
                                                            {permission.name}
                                                        </span>
                                                    ) : null;
                                                })}
                                                {selectedPermissions.length > 3 && (
                                                    <span className="badge badge-secondary mr-2 mb-2" style={{fontSize: '12px', padding: '6px 12px'}}>
                                                        +{selectedPermissions.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-muted">No direct permissions selected</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <div className="text-center py-5">
                                <i className="fa fa-spinner fa-spin fa-3x text-primary"></i>
                                <p className="mt-3" style={{fontSize: '16px', color: '#6c757d'}}>Loading permissions and roles...</p>
                            </div>
                        ) : (
                            <div className="row">
                                {/* Roles Section */}
                                <div className="col-lg-4">
                                    <div className="card" style={{border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
                                        <div className="card-header" style={{backgroundColor: '#007bff', color: 'white', borderRadius: '8px 8px 0 0'}}>
                                            <div className="d-flex align-items-center justify-content-between">
                                                <h6 className="mb-0" style={{fontWeight: '600'}}>
                                                    <i className="fa fa-users-cog mr-2"></i>
                                                    Roles
                                                </h6>
                                                <span className="badge badge-light text-primary" style={{fontSize: '12px'}}>
                                                    {selectedRoles.length} selected
                                                </span>
                                            </div>
                                        </div>
                                        <div className="card-body p-0" style={{maxHeight: '400px', overflowY: 'auto'}}>
                                            {roles.length === 0 ? (
                                                <div className="text-center py-4">
                                                    <i className="fa fa-users fa-2x text-muted mb-2"></i>
                                                    <p className="text-muted">No roles available</p>
                                                </div>
                                            ) : (
                                                <div className="p-3">
                                                    {roles.map(role => (
                                                        <div key={role.id} 
                                                             className="p-3 mb-3 rounded cursor-pointer bg-light"
                                                             style={{
                                                                 border: selectedRoles.includes(role.id) ? '2px solid #007bff' : '1px solid #dee2e6',
                                                                 transition: 'all 0.3s ease',
                                                                 cursor: 'pointer'
                                                             }}
                                                             onClick={() => {
                                                                 console.log('🔍 DEBUG: Role card clicked:', role.id, role.name);
                                                                 handleRoleToggle(role.id);
                                                             }}>
                                                            <div className="d-flex align-items-start">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedRoles.includes(role.id)}
                                                                    onChange={() => handleRoleToggle(role.id)}
                                                                    style={{
                                                                        transform: 'scale(1.3)',
                                                                        marginRight: '12px',
                                                                        marginTop: '2px'
                                                                    }}
                                                                />
                                                                <div className="flex-grow-1">
                                                                    <div className="d-flex align-items-center mb-2">
                                                                        <h6 className="mb-0" style={{
                                                                            fontSize: '14px',
                                                                            fontWeight: '600',
                                                                            color: '#495057'
                                                                        }}>
                                                                            {role.name}
                                                                        </h6>
                                                                        {role.is_system_role && (
                                                                            <span className="badge badge-warning ml-2" 
                                                                                  style={{fontSize: '10px'}}>
                                                                                System
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <p className="mb-2" style={{
                                                                        fontSize: '12px',
                                                                        color: '#6c757d',
                                                                        lineHeight: '1.4'
                                                                    }}>
                                                                        {role.description}
                                                                    </p>
                                                                    <div className="d-flex align-items-center">
                                                                        <i className="fa fa-key mr-1 text-info" 
                                                                           style={{fontSize: '11px'}}></i>
                                                                        <small style={{
                                                                            fontSize: '11px',
                                                                            color: '#6c757d'
                                                                        }}>
                                                                            {role.permission_count || 0} permissions
                                                                        </small>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Permissions Section */}
                                <div className="col-lg-8">
                                    <div className="card" style={{border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
                                        <div className="card-header" style={{backgroundColor: '#28a745', color: 'white', borderRadius: '8px 8px 0 0'}}>
                                            <div className="d-flex align-items-center justify-content-between">
                                                <h6 className="mb-0" style={{fontWeight: '600'}}>
                                                    <i className="fa fa-key mr-2"></i>
                                                    Direct Permissions
                                                </h6>
                                                <span className="badge badge-light text-success" style={{fontSize: '12px'}}>
                                                    {selectedPermissions.length} selected
                                                </span>
                                            </div>
                                        </div>
                                        <div className="card-body p-0" style={{maxHeight: '400px', overflowY: 'auto'}}>
                                            {Object.keys(groupedPermissions).length === 0 ? (
                                                <div className="text-center py-4">
                                                    <i className="fa fa-key fa-2x text-muted mb-2"></i>
                                                    <p className="text-muted">No permissions available</p>
                                                </div>
                                            ) : (
                                                <div className="p-3">
                                                    {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                                                        <div key={category} className="mb-4">
                                                            <div className="d-flex align-items-center justify-content-between mb-3" style={{
                                                                borderBottom: '2px solid #e9ecef',
                                                                paddingBottom: '8px'
                                                            }}>
                                                                <h6 className="mb-0" style={{
                                                                    fontSize: '14px',
                                                                    fontWeight: '600',
                                                                    color: '#495057'
                                                                }}>
                                                                    <i className="fa fa-folder mr-2" style={{color: '#007bff'}}></i>
                                                                    {category.charAt(0).toUpperCase() + category.slice(1)}
                                                                </h6>
                                                                <span className="badge badge-primary" style={{fontSize: '10px'}}>
                                                                    {categoryPermissions.length}
                                                                </span>
                                                            </div>
                                                            <div className="row">
                                                                {categoryPermissions.map(permission => (
                                                                    <div key={permission.id} className="col-md-6 mb-3">
                                                                        <div className="p-3 rounded cursor-pointer bg-light"
                                                                             style={{
                                                                                 border: selectedPermissions.includes(permission.id) ? '2px solid #28a745' : '1px solid #dee2e6',
                                                                                 transition: 'all 0.3s ease',
                                                                                 cursor: 'pointer',
                                                                                 minHeight: '80px'
                                                                             }}
                                                                             onClick={() => {
                                                                                 console.log('🔍 DEBUG: Permission card clicked:', permission.id, permission.name);
                                                                                 handlePermissionToggle(permission.id);
                                                                             }}>
                                                                            <div className="d-flex align-items-start">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={selectedPermissions.includes(permission.id)}
                                                                                    onChange={() => {
                                                                                        console.log('🔍 DEBUG: Permission checkbox clicked:', permission.id, permission.name);
                                                                                        handlePermissionToggle(permission.id);
                                                                                    }}
                                                                                    style={{
                                                                                        transform: 'scale(1.3)',
                                                                                        marginRight: '12px',
                                                                                        marginTop: '2px'
                                                                                    }}
                                                                                />
                                                                                <div className="flex-grow-1">
                                                                                    <h6 className="mb-1" style={{
                                                                                        fontSize: '13px',
                                                                                        fontWeight: '600',
                                                                                        color: '#495057'
                                                                                    }}>
                                                                                        {permission.name}
                                                                                    </h6>
                                                                                    <p className="mb-1" style={{
                                                                                        fontSize: '10px',
                                                                                        color: '#6c757d'
                                                                                    }}>
                                                                                        <code className="px-1 rounded bg-light">
                                                                                            {permission.codename}
                                                                                        </code>
                                                                                    </p>
                                                                                    {permission.description && (
                                                                                        <p className="mb-0" style={{
                                                                                            fontSize: '10px',
                                                                                            color: '#6c757d',
                                                                                            lineHeight: '1.3'
                                                                                        }}>
                                                                                            {permission.description}
                                                                                        </p>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="modal-footer" style={{
                        flexShrink: 0, 
                        backgroundColor: '#f8f9fa', 
                        borderTop: '1px solid #dee2e6',
                        padding: '15px 20px'
                    }}>
                        <div className="d-flex justify-content-between align-items-center w-100">
                            <div className="text-muted" style={{fontSize: '14px'}}>
                                <i className="fa fa-info-circle mr-1"></i>
                                Select roles and permissions for this user
                            </div>
                            <div>
                                <button type="button" className="btn btn-outline-secondary mr-2" onClick={onClose}>
                                    <i className="fa fa-times mr-1"></i>
                                    Cancel
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-primary" 
                                    onClick={handleSave}
                                    disabled={saving}
                                    style={{
                                        backgroundColor: '#007bff',
                                        borderColor: '#007bff',
                                        fontWeight: '500'
                                    }}
                                >
                                    {saving ? (
                                        <>
                                            <i className="fa fa-spinner fa-spin mr-2"></i>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa fa-save mr-2"></i>
                                            Save Permissions
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserPermissionAssignment;
