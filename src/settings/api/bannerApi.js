const API_BASE_URL = 'http://localhost:8000/api/settings';

class BannerApi {
    // Get all banners (admin only)
    async getAllBanners() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/banners/`, {
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
            console.error('BannerApi: Error fetching all banners:', error);
            throw error;
        }
    }

    // Get active banners (public endpoint)
    async getActiveBanners() {
        try {
            console.log('BannerApi: Fetching active banners from:', `${API_BASE_URL}/banners/get_active_banners/`);
            const response = await fetch(`${API_BASE_URL}/banners/get_active_banners/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if(!response.ok) {
                const errorText = await response.text();
                console.error('BannerApi: Error response:', errorText);
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }

            const data = await response.json();

            // Convert relative URLs to full URLs
            const processedData = data.map(banner => ({
                ...banner,
                banner_url: banner.banner_url && banner.banner_url.startsWith('/media/')
                    ? `http://localhost:8000${banner.banner_url}`
                    : banner.banner_url
            }));

            return processedData;
        } catch(error) {
            console.error('BannerApi: Error fetching active banners:', error);
            throw error;
        }
    }

    // Create new banner
    async createBanner(bannerData) {
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();

            formData.append('name', bannerData.name);
            formData.append('banner_image', bannerData.banner_image);
            formData.append('is_active', bannerData.is_active);
            formData.append('display_order', bannerData.display_order);

            const response = await fetch(`${API_BASE_URL}/banners/`, {
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
            console.error('BannerApi: Error creating banner:', error);
            throw error;
        }
    }

    // Update banner
    async updateBanner(bannerId, bannerData) {
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();

            if(bannerData.name) formData.append('name', bannerData.name);
            if(bannerData.banner_image) formData.append('banner_image', bannerData.banner_image);
            if(bannerData.is_active !== undefined) formData.append('is_active', bannerData.is_active);
            if(bannerData.display_order !== undefined) formData.append('display_order', bannerData.display_order);

            const response = await fetch(`${API_BASE_URL}/banners/${bannerId}/`, {
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
            console.error('BannerApi: Error updating banner:', error);
            throw error;
        }
    }

    // Delete banner
    async deleteBanner(bannerId) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/banners/${bannerId}/`, {
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
            console.error('BannerApi: Error deleting banner:', error);
            throw error;
        }
    }

    // Activate banner
    async activateBanner(bannerId) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/banners/${bannerId}/activate/`, {
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
            console.error('BannerApi: Error activating banner:', error);
            throw error;
        }
    }

    // Deactivate banner
    async deactivateBanner(bannerId) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/banners/${bannerId}/deactivate/`, {
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
            console.error('BannerApi: Error deactivating banner:', error);
            throw error;
        }
    }

    // Get banner statistics
    async getBannerStats() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/banners/stats/`, {
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
            console.error('BannerApi: Error fetching banner stats:', error);
            throw error;
        }
    }
}

export default new BannerApi();
