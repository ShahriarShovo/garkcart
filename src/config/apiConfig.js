// API Configuration for centralized URL management
// This file manages all API endpoints and base URLs

const API_CONFIG = {
    // Base URL - can be overridden by environment variables
    BASE_URL: process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000',
    
    // WebSocket Base URL - can be overridden by environment variables
    WS_BASE_URL: process.env.REACT_APP_WS_URL || 'ws://127.0.0.1:8000',
    
    // API Endpoints
    ENDPOINTS: {
        // Authentication
        AUTH: {
            LOGIN: '/api/accounts/login/',
            REGISTER: '/api/accounts/register/',
            PROFILE: '/api/accounts/profile/',
            REFRESH: '/api/accounts/token/refresh/',
            LOGOUT: '/api/accounts/logout/',
            USERS: '/api/accounts/users/',
            STATISTICS: '/api/accounts/statistics/',
            UPDATE_PROFILE: '/api/accounts/update-profile/',
            CHANGE_PASSWORD: '/api/accounts/change-password/',
            VERIFY_EMAIL: '/api/accounts/verify-email/',
            RESEND_VERIFICATION: '/api/accounts/resend-verification/',
            FORGOT_PASSWORD: '/api/accounts/forgot-password/',
            RESET_PASSWORD: '/api/accounts/reset-password/',
            // Permission Management
            PERMISSIONS_LIST: '/api/accounts/permissions/permissions/',
            PERMISSION_CATEGORIES: '/api/accounts/permissions/permissions/categories/',
            CREATE_DEFAULT_PERMISSIONS: '/api/accounts/permissions/permissions/create-defaults/',
            ROLES: '/api/accounts/permissions/roles/',
            ROLE_DETAIL: '/api/accounts/permissions/roles/',
            ROLE_PERMISSIONS: '/api/accounts/permissions/roles/',
            // Lists users with their permissions (admin view)
            USER_PERMISSIONS_USERS_LIST: '/api/accounts/permissions/users/permissions/',
            // Assign permissions to a user (expects user_id in POST body)
            ASSIGN_PERMISSIONS: '/api/accounts/permissions/users/assign-permissions/',
            // Check a permission for current user
            CHECK_PERMISSION: '/api/accounts/permissions/check-permission/',
            // Get current user's permissions
            USER_PERMISSIONS_LIST: '/api/accounts/permissions/user-permissions/'
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
        },
        
        // WebSocket Endpoints
        WEBSOCKET: {
            CHAT: '/ws/chat/',
            ADMIN_INBOX: '/ws/admin/inbox/',
            ADMIN_CONTACTS: '/ws/admin/contacts/',
            ADMIN_ORDERS: '/ws/admin/orders/'
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
    },
    
    // Helper function to get WebSocket URL
    getWebSocketUrl: (endpoint, token) => {
        const wsUrl = `${API_CONFIG.WS_BASE_URL}${endpoint}`;
        return token ? `${wsUrl}?token=${token}` : wsUrl;
    },
    
    // Helper function to get WebSocket URL by category and action
    getWebSocketEndpoint: (category, action) => {
        if (API_CONFIG.ENDPOINTS.WEBSOCKET[category] && API_CONFIG.ENDPOINTS.WEBSOCKET[category][action]) {
            return API_CONFIG.ENDPOINTS.WEBSOCKET[category][action];
        }
        throw new Error(`WebSocket endpoint not found: ${category}.${action}`);
    }
};

export default API_CONFIG;
