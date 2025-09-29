# API Configuration Guide

## 🎯 Centralized API URL Management

This project now uses a centralized API configuration system that makes it easy to manage different environments (development, staging, production).

### 📁 Configuration Files

#### 1. **`src/config/apiConfig.js`**

- Main API configuration file
- Contains all API endpoints and base URL
- Provides helper functions for URL generation

#### 2. **`src/config/environment.js`**

- Environment-specific settings
- Manages different environment configurations

#### 3. **`src/config/constants.js`**

- Application-wide constants
- HTTP status codes, user types, etc.

### 🔧 Usage

#### **Import the config:**

```javascript
import API_CONFIG from "../config/apiConfig";
```

#### **Use helper functions:**

```javascript
// Get full URL for an endpoint
const url = API_CONFIG.getFullUrl("AUTH", "LOGIN");
// Result: http://localhost:8000/api/accounts/login/

// Get base URL
const baseUrl = API_CONFIG.BASE_URL;
// Result: http://localhost:8000

// Get specific endpoint
const endpoint = API_CONFIG.getEndpoint("PRODUCTS", "DETAIL");
// Result: /api/products/product-detail/
```

### 🌍 Environment Variables

#### **Development (.env.local):**

```bash
REACT_APP_API_URL=http://localhost:8000
REACT_APP_DEBUG=true
REACT_APP_LOG_LEVEL=debug
```

#### **Production (.env.production):**

```bash
REACT_APP_API_URL=https://yourdomain.com
REACT_APP_DEBUG=false
REACT_APP_LOG_LEVEL=error
```

### 🚀 Benefits

#### **✅ Development:**

- Easy local development with `http://localhost:8000`
- Quick testing with different environments
- No hardcoded URLs in components

#### **✅ Production:**

- Single place to change domain
- Environment-specific configurations
- Easy deployment to different servers

#### **✅ Maintenance:**

- Centralized management of all API URLs
- Consistent configuration across the app
- Easy updates for new endpoints

### 📝 Available Endpoints

#### **Authentication:**

- `AUTH.LOGIN` → `/api/accounts/login/`
- `AUTH.REGISTER` → `/api/accounts/register/`
- `AUTH.PROFILE` → `/api/accounts/profile/`
- `AUTH.REFRESH` → `/api/accounts/token/refresh/`

#### **Products:**

- `PRODUCTS.LIST` → `/api/products/`
- `PRODUCTS.DETAIL` → `/api/products/product-detail/`
- `PRODUCTS.REVIEWS` → `/api/products/product-reviews/`
- `PRODUCTS.CATEGORIES` → `/api/products/category/`

#### **Cart:**

- `CART.GET` → `/api/cart/`
- `CART.ADD` → `/api/cart/add/`
- `CART.REMOVE` → `/api/cart/remove/`
- `CART.CLEAR` → `/api/cart/clear/`

#### **Orders:**

- `ORDERS.LIST` → `/api/orders/`
- `ORDERS.CREATE` → `/api/orders/create/`
- `ORDERS.TRACKING` → `/api/orders/tracking/`

#### **Settings:**

- `SETTINGS.LOGO` → `/api/settings/logos/get_active_logo/`
- `SETTINGS.BANNERS` → `/api/settings/banners/get_active_banners/`
- `SETTINGS.FOOTER` → `/api/settings/footer-settings/active/`

### 🔄 Migration Complete

All hardcoded `http://localhost:8000` URLs have been replaced with centralized configuration. The system is now ready for:

- **Development:** `http://localhost:8000`
- **Staging:** `https://staging.yourdomain.com`
- **Production:** `https://yourdomain.com`

### 🎯 Next Steps

1. **Create environment files** for different environments
2. **Update build process** for production deployment
3. **Test environment switching** to ensure proper configuration
4. **Deploy to production** with confidence!

---

**🎉 Your API configuration is now centralized and production-ready!** 🚀
