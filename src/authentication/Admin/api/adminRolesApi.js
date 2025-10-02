import API_CONFIG from '../../../config/apiConfig';

const AdminRolesApi = {
    async listAdminsAndStaff() {
        const token = localStorage.getItem('token');
        const resp = await fetch(`${API_CONFIG.BASE_URL}/api/accounts/users/admins-staff/`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!resp.ok) throw new Error('Failed to load admins/staff');
        const data = await resp.json();
        return data.data || [];
    },

    async setUserRole(userId, payload) {
        const token = localStorage.getItem('token');
        const resp = await fetch(`${API_CONFIG.BASE_URL}/api/accounts/users/${userId}/set-role/`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.message || 'Failed to update user role');
        return data.data;
    }
};

export default AdminRolesApi;

