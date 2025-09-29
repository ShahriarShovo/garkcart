// API Configuration for centralized URL management
// This file manages all API endpoints and base URLs

const API_CONFIG = {
    // Base URL - can be overridden by environment variables
    BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
    
    // API Endpoints
    ENDPOINTS: {
        // Authentication
        AUTH: {
            LOGIN: '/api/accounts/login/',
            REGISTER: '/api/accounts/register/',
            PROFILE: '/api/accounts/profile/',
            REFRESH: '/api/accounts/token/refresh/',
            LOGOUT: '/api/accounts/logout/'
        },
        
        // Products
        PRODUCTS: {
            LIST: '/api/products/',
            DETAIL: '/api/products/product-detail/',
            REVIEWS: '/api/products/product-reviews/',
            CATEGORIES: '/api/products/category/',
            SUBCATEGORIES: '/api/products/category/',
            PAGINATION: '/api/products/pagination/products/',
            SEARCH: '/api/products/search/'
        },
        
        // Cart
        CART: {
            GET: '/api/cart/',
            ADD: '/api/cart/add/',
            REMOVE: '/api/cart/remove/',
            UPDATE: '/api/cart/update/',
            CLEAR: '/api/cart/clear/'
        },
        
        // Orders
        ORDERS: {
            LIST: '/api/orders/',
            CREATE: '/api/orders/create/',
            DETAIL: '/api/orders/',
            TRACKING: '/api/orders/tracking/'
        },
        
        // Settings
        SETTINGS: {
            LOGO: '/api/settings/logos/get_active_logo/',
            BANNERS: '/api/settings/banners/get_active_banners/',
            FOOTER: '/api/settings/footer-settings/active/'
        },
        
        // Contact
        CONTACT: {
            SUBMIT: '/api/contact/submit/',
            LIST: '/api/contact/messages/',
            DETAIL: '/api/contact/messages/'
        }
    },
    
    // Helper function to get full URL
    getUrl: (endpoint) => {
        return `${API_CONFIG.BASE_URL}${endpoint}`;
    },
    
    // Helper function to get endpoint by category and action
    getEndpoint: (category, action) => {
        if (API_CONFIG.ENDPOINTS[category] && API_CONFIG.ENDPOINTS[category][action]) {
            return API_CONFIG.ENDPOINTS[category][action];
        }
        throw new Error(`Endpoint not found: ${category}.${action}`);
    },
    
    // Helper function to get full URL by category and action
    getFullUrl: (category, action) => {
        const endpoint = API_CONFIG.getEndpoint(category, action);
        return API_CONFIG.getUrl(endpoint);
    }
};

export default API_CONFIG;
