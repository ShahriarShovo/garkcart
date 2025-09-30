import API_CONFIG from '../../config/apiConfig';

class NotificationApi {
    constructor() {
        this.baseURL = `${API_CONFIG.BASE_URL}/api/notifications`;
    }

    getAuthHeaders() {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };
    }

    // Get all notifications (admin only)
    async getNotifications() {
        try {
            const response = await fetch(`${this.baseURL}/notifications/`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if(!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch(error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }
    }

    // Get active notifications for visitors (public)
    async getActiveNotifications() {
        try {
            const response = await fetch(`${this.baseURL}/notifications/active_notifications/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if(!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch(error) {
            console.error('Error fetching active notifications:', error);
            throw error;
        }
    }

    // Create a new notification (admin only)
    async createNotification(notificationData) {
        try {
            const response = await fetch(`${this.baseURL}/notifications/`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(notificationData)
            });

            if(!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch(error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    }

    // Update a notification (admin only)
    async updateNotification(id, notificationData) {
        try {
            const response = await fetch(`${this.baseURL}/notifications/${id}/`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(notificationData)
            });

            if(!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch(error) {
            console.error('Error updating notification:', error);
            throw error;
        }
    }

    // Delete a notification (admin only)
    async deleteNotification(id) {
        try {
            const response = await fetch(`${this.baseURL}/notifications/${id}/`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });

            if(!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return true;
        } catch(error) {
            console.error('Error deleting notification:', error);
            throw error;
        }
    }

    // Mark notification as viewed (public)
    async markNotificationViewed(id) {
        try {
            const response = await fetch(`${this.baseURL}/notifications/${id}/mark_viewed/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if(!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch(error) {
            console.error('Error marking notification as viewed:', error);
            throw error;
        }
    }

    // Toggle notification active status (admin only)
    async toggleNotificationActive(id) {
        try {
            const response = await fetch(`${this.baseURL}/notifications/${id}/toggle_active/`, {
                method: 'POST',
                headers: this.getAuthHeaders()
            });

            if(!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch(error) {
            console.error('Error toggling notification active status:', error);
            throw error;
        }
    }

    // Get notification statistics (admin only)
    async getNotificationStats() {
        try {
            const response = await fetch(`${this.baseURL}/notifications/stats/`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if(!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch(error) {
            console.error('Error fetching notification stats:', error);
            throw error;
        }
    }
}

export default new NotificationApi();
