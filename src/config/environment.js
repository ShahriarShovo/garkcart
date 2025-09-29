// Environment-specific configuration
// This file manages different environment settings

const ENVIRONMENTS = {
    DEVELOPMENT: {
        API_URL: 'http://localhost:8000',
        DEBUG: true,
        LOG_LEVEL: 'debug'
    },
    STAGING: {
        API_URL: 'https://staging.yourdomain.com',
        DEBUG: true,
        LOG_LEVEL: 'info'
    },
    PRODUCTION: {
        API_URL: 'https://yourdomain.com',
        DEBUG: false,
        LOG_LEVEL: 'error'
    }
};

// Get current environment
const getCurrentEnvironment = () => {
    if (process.env.NODE_ENV === 'production') {
        return 'PRODUCTION';
    } else if (process.env.NODE_ENV === 'staging') {
        return 'STAGING';
    } else {
        return 'DEVELOPMENT';
    }
};

// Get environment config
const getEnvironmentConfig = () => {
    const currentEnv = getCurrentEnvironment();
    return ENVIRONMENTS[currentEnv];
};

// Export current environment config
export const ENV_CONFIG = getEnvironmentConfig();
export const CURRENT_ENV = getCurrentEnvironment();

export default ENV_CONFIG;
