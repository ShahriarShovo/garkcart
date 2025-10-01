import API_CONFIG from '../../../config/apiConfig';

class AdminUserManagementApi {
    constructor() {
        this.baseURL = API_CONFIG.BASE_URL;
    }

    /**
     * Get detailed user information for admin management
     */
    async getUserDetails(userId) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${this.baseURL}/api/accounts/admin/users/${userId}/details/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to get user details');
        }

        return response.json();
    }

    /**
     * Update user profile (admin can update any user's profile)
     */
    async updateUserProfile(userId, profileData) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${this.baseURL}/api/accounts/admin/users/${userId}/profile/`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(profileData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update user profile');
        }

        return response.json();
    }

    /**
     * Change user password (admin can change any user's password)
     */
    async changeUserPassword(userId, newPassword, confirmPassword) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${this.baseURL}/api/accounts/admin/users/change-password/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: userId,
                new_password: newPassword,
                confirm_password: confirmPassword,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to change user password');
        }

        return response.json();
    }

    /**
     * Update user basic information (email, is_active, etc.)
     */
    async updateUserBasicInfo(userId, userData) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${this.baseURL}/api/accounts/users/${userId}/`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update user information');
        }

        return response.json();
    }
}

export default new AdminUserManagementApi();
