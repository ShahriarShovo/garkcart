const API_BASE_URL = 'http://localhost:8000/api/settings';

class LogoApi {
    // Get all logos (admin only)
    async getAllLogos() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/logos/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if(!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch(error) {
            console.error('LogoApi: Error fetching all logos:', error);
            throw error;
        }
    }

    // Get active logo (public endpoint)
    async getActiveLogo() {
        try {
            console.log('LogoApi: Fetching active logo from:', `${API_BASE_URL}/logos/get_active_logo/`);
            const response = await fetch(`${API_BASE_URL}/logos/get_active_logo/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if(!response.ok) {
                const errorText = await response.text();
                console.error('LogoApi: Error response:', errorText);
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }

            const data = await response.json();

            // Convert relative URL to full URL
            if(data.logo_url && data.logo_url.startsWith('/media/')) {
                data.logo_url = `http://localhost:8000${data.logo_url}`;
            }

            return data;
        } catch(error) {
            console.error('LogoApi: Error fetching active logo:', error);
            throw error;
        }
    }

    // Create new logo
    async createLogo(logoData) {
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();

            formData.append('name', logoData.name);
            formData.append('logo_image', logoData.logo_image);
            formData.append('is_active', logoData.is_active);

            const response = await fetch(`${API_BASE_URL}/logos/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            if(!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status} - ${JSON.stringify(errorData)}`);
            }

            return await response.json();
        } catch(error) {
            console.error('LogoApi: Error creating logo:', error);
            throw error;
        }
    }

    // Update logo
    async updateLogo(logoId, logoData) {
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();

            if(logoData.name) formData.append('name', logoData.name);
            if(logoData.logo_image) formData.append('logo_image', logoData.logo_image);
            if(logoData.is_active !== undefined) formData.append('is_active', logoData.is_active);

            const response = await fetch(`${API_BASE_URL}/logos/${logoId}/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            if(!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status} - ${JSON.stringify(errorData)}`);
            }

            return await response.json();
        } catch(error) {
            console.error('LogoApi: Error updating logo:', error);
            throw error;
        }
    }

    // Delete logo
    async deleteLogo(logoId) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/logos/${logoId}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if(!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return true;
        } catch(error) {
            console.error('LogoApi: Error deleting logo:', error);
            throw error;
        }
    }

    // Activate logo
    async activateLogo(logoId) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/logos/${logoId}/activate/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if(!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch(error) {
            console.error('LogoApi: Error activating logo:', error);
            throw error;
        }
    }

    // Get logo statistics
    async getLogoStats() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/logos/stats/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if(!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch(error) {
            console.error('LogoApi: Error fetching logo stats:', error);
            throw error;
        }
    }
}

export default new LogoApi();
