import API_CONFIG from '../../../config/apiConfig';

class PermissionApi {
    constructor() {
        this.baseURL = API_CONFIG.BASE_URL;
    }

    // Permission Management
    async getPermissions() {
        const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.AUTH.PERMISSIONS}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch permissions');
        }
        return response.json();
    }

    async getPermissionCategories() {
        const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.AUTH.PERMISSION_CATEGORIES}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch permission categories');
        }
        return response.json();
    }

    async createDefaultPermissions() {
        const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.AUTH.CREATE_DEFAULT_PERMISSIONS}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create default permissions');
        }
        return response.json();
    }

    // Role Management
    async getRoles() {
        const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.AUTH.ROLES}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch roles');
        }
        return response.json();
    }

    async createRole(roleData) {
        const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.AUTH.ROLES}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(roleData)
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create role');
        }
        return response.json();
    }

    async updateRole(roleId, roleData) {
        const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.AUTH.ROLE_DETAIL}${roleId}/`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(roleData)
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update role');
        }
        return response.json();
    }

    async deleteRole(roleId) {
        const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.AUTH.ROLE_DETAIL}${roleId}/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete role');
        }
        return response.json();
    }

    async getRolePermissions(roleId) {
        const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.AUTH.ROLE_PERMISSIONS}${roleId}/permissions/`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch role permissions');
        }
        return response.json();
    }

    async assignRolePermissions(roleId, permissionIds) {
        const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.AUTH.ROLE_PERMISSIONS}${roleId}/permissions/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ permission_ids: permissionIds })
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to assign role permissions');
        }
        return response.json();
    }

    // User Permission Management
    async getUserPermissions() {
        const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.AUTH.USER_PERMISSIONS}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch user permissions');
        }
        return response.json();
    }

    async assignUserPermissions(userId, permissionIds, roleIds) {
        console.log('🔍 DEBUG: API Call - assignUserPermissions');
        console.log('🔍 DEBUG: URL:', `${this.baseURL}${API_CONFIG.ENDPOINTS.AUTH.ASSIGN_PERMISSIONS}`);
        console.log('🔍 DEBUG: Request data:', {
            user_id: userId,
            permission_ids: permissionIds,
            role_ids: roleIds
        });
        
        const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.AUTH.ASSIGN_PERMISSIONS}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: userId,
                permission_ids: permissionIds,
                role_ids: roleIds
            })
        });
        
        console.log('🔍 DEBUG: Response status:', response.status);
        console.log('🔍 DEBUG: Response ok:', response.ok);
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('🔍 DEBUG: Error response:', errorData);
            console.error('🔍 DEBUG: Error details:', JSON.stringify(errorData, null, 2));
            throw new Error(errorData.message || errorData.detail || 'Failed to assign user permissions');
        }
        
        const result = await response.json();
        console.log('🔍 DEBUG: Success response:', result);
        return result;
    }

    // Permission Checking
    async checkPermission(permissionCodename, userId = null) {
        const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.AUTH.CHECK_PERMISSION}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                permission_codename: permissionCodename,
                user_id: userId
            })
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to check permission');
        }
        return response.json();
    }

    async getCurrentUserPermissions() {
        const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.AUTH.USER_PERMISSIONS_LIST}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch current user permissions');
        }
        return response.json();
    }
}

export default new PermissionApi();
