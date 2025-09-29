// Application constants
// This file contains all application-wide constants

export const APP_CONSTANTS = {
    // Application Info
    APP_NAME: 'GreatKart',
    VERSION: '1.0.0',
    
    // API Configuration
    API_TIMEOUT: 10000, // 10 seconds
    MAX_RETRIES: 3,
    
    // Pagination
    DEFAULT_PAGE_SIZE: 12,
    MAX_PAGE_SIZE: 50,
    
    // Cart
    MAX_CART_ITEMS: 100,
    CART_EXPIRY_DAYS: 30,
    
    // File Upload
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    
    // UI Constants
    TOAST_DURATION: 3000, // 3 seconds
    DEBOUNCE_DELAY: 300, // 300ms
    
    // Local Storage Keys
    STORAGE_KEYS: {
        TOKEN: 'token',
        REFRESH_TOKEN: 'refresh',
        USER: 'savedUser',
        CART: 'cart',
        THEME: 'theme'
    },
    
    // HTTP Status Codes
    HTTP_STATUS: {
        OK: 200,
        CREATED: 201,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        INTERNAL_SERVER_ERROR: 500
    },
    
    // User Types
    USER_TYPES: {
        CUSTOMER: 'customer',
        ADMIN: 'admin',
        STAFF: 'staff'
    },
    
    // Order Status
    ORDER_STATUS: {
        PENDING: 'pending',
        CONFIRMED: 'confirmed',
        SHIPPED: 'shipped',
        DELIVERED: 'delivered',
        CANCELLED: 'cancelled'
    },
    
    // Payment Status
    PAYMENT_STATUS: {
        PENDING: 'pending',
        PAID: 'paid',
        FAILED: 'failed',
        REFUNDED: 'refunded'
    }
};

export default APP_CONSTANTS;
