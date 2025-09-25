class DiscountApi {
    constructor() {
        this.baseURL = 'http://127.0.0.1:8000/api/notifications';
    }

    getAuthHeaders() {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };
    }

    // Get all discounts (admin only)
    async getDiscounts() {
        try {
            const response = await fetch(`${this.baseURL}/discounts/`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if(!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch(error) {
            console.error('Error fetching discounts:', error);
            throw error;
        }
    }

    // Get active discounts for visitors (public)
    async getActiveDiscounts() {
        try {
            const response = await fetch(`${this.baseURL}/discounts/active_discounts/`, {
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
            console.error('Error fetching active discounts:', error);
            throw error;
        }
    }

    // Create a new discount (admin only)
    async createDiscount(discountData) {
        try {
            const response = await fetch(`${this.baseURL}/discounts/`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(discountData)
            });

            if(!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch(error) {
            console.error('Error creating discount:', error);
            throw error;
        }
    }

    // Update a discount (admin only)
    async updateDiscount(id, discountData) {
        try {
            const response = await fetch(`${this.baseURL}/discounts/${id}/`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(discountData)
            });

            if(!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch(error) {
            console.error('Error updating discount:', error);
            throw error;
        }
    }

    // Delete a discount (admin only)
    async deleteDiscount(id) {
        try {
            const response = await fetch(`${this.baseURL}/discounts/${id}/`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });

            if(!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return true;
        } catch(error) {
            console.error('Error deleting discount:', error);
            throw error;
        }
    }

    // Calculate discount for cart items (public)
    async calculateDiscount(cartItems, userId = null) {
        try {
            const response = await fetch(`${this.baseURL}/discounts/calculate_discount/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    cart_items: cartItems,
                    user_id: userId
                })
            });

            if(!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch(error) {
            console.error('Error calculating discount:', error);
            throw error;
        }
    }

    // Apply a specific discount (public)
    async applyDiscount(discountId, cartItems, userId = null) {
        try {
            const response = await fetch(`${this.baseURL}/discounts/${discountId}/apply_discount/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    cart_items: cartItems,
                    user_id: userId
                })
            });

            if(!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch(error) {
            console.error('Error applying discount:', error);
            throw error;
        }
    }

    // Toggle discount status (admin only)
    async toggleDiscountStatus(id) {
        try {
            const response = await fetch(`${this.baseURL}/discounts/${id}/toggle_status/`, {
                method: 'POST',
                headers: this.getAuthHeaders()
            });

            if(!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch(error) {
            console.error('Error toggling discount status:', error);
            throw error;
        }
    }

    // Get discount statistics (admin only)
    async getDiscountStats() {
        try {
            const response = await fetch(`${this.baseURL}/discounts/stats/`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if(!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch(error) {
            console.error('Error fetching discount stats:', error);
            throw error;
        }
    }

    // Get discount usage history (admin only)
    async getDiscountUsage() {
        try {
            const response = await fetch(`${this.baseURL}/discount-usage/`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if(!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch(error) {
            console.error('Error fetching discount usage:', error);
            throw error;
        }
    }

    // Get active discounts for display in notifications (public)
    async getActiveDiscountsForDisplay() {
        try {
            const response = await fetch(`${this.baseURL}/discounts/get_active_discounts_for_display/`, {
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
            console.error('Error fetching active discounts for display:', error);
            throw error;
        }
    }
}

export default new DiscountApi();
