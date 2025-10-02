import React, {createContext, useContext, useState} from 'react';
import API_CONFIG from '../config/apiConfig';

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [refreshTimer, setRefreshTimer] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);

    const login = async (userData) => {
        try {
            const response = await fetch(API_CONFIG.getFullUrl('AUTH', 'LOGIN'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });
            
            if(response.ok) {
                const data = await response.json();
                
                // Set user data from response
                const userInfo = {
                    email: userData.email,
                    token: data.token,
                    user_type: data.user_type || 'customer',
                    is_admin: data.is_admin || false,
                    is_superuser: data.is_superuser || false,
                    is_staff: data.is_staff || false,
                    email_verified: data.email_verified || false
                };
                
                setUser(userInfo);
                setIsAuthenticated(true);
                localStorage.setItem('user', JSON.stringify(userInfo));
                localStorage.setItem('token', data.token.access);
                localStorage.setItem('refresh_token', data.token.refresh);
                
                // schedule token refresh ~5 minutes before expiry
                scheduleTokenRefresh();

                // If admin/staff is logging in, notify chat panels
                if(userInfo.is_staff || userInfo.is_superuser || userInfo.is_admin) {
                    window.dispatchEvent(new CustomEvent('admin_status_changed', {
                        detail: {status: 'online'}
                    }));
                } else {
                }

                return {success: true, message: data.message, user: userInfo};
            } else {
                const errorData = await response.json();
                console.error('AuthContext: Login failed:', errorData);
                
                // Check if it's an email verification error
                if(errorData.email_verification_required) {
                    return {
                        success: false, 
                        message: errorData.message || 'Please verify your email address before logging in.',
                        email_verification_required: true,
                        email: errorData.email
                    };
                }
                
                return {success: false, message: errorData.message || 'Login failed'};
            }
        } catch(error) {
            console.error('AuthContext: Login error:', error);
            return {success: false, message: 'Network error occurred'};
        }
    };

    const logout = () => {
        // Check if user is admin/staff before logout
        const currentUser = user;
        const isAdmin = currentUser && (currentUser.is_staff || currentUser.is_superuser || currentUser.is_admin);

        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        
        if(refreshTimer) {
            clearTimeout(refreshTimer);
            setRefreshTimer(null);
        }

        // If admin/staff is logging out, notify chat panels
        if(isAdmin) {
            window.dispatchEvent(new CustomEvent('admin_status_changed', {
                detail: {status: 'offline'}
            }));
        } else {
        }
    };

    const register = async (userData) => {
        try {
            const response = await fetch(API_CONFIG.getFullUrl('AUTH', 'REGISTER'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if(response.ok) {
                const data = await response.json();

                // For email verification, we should NOT automatically login the user
                // User should verify email first before getting tokens
                if (data.email_verification_sent) {
                    const result = {
                        success: true, 
                        message: data.message, 
                        user: {
                            email: userData.email,
                            full_name: userData.full_name,
                        },
                        email_verification_sent: data.email_verification_sent || false
                    };
                    
                    return result;
                } else {
                    // If no email verification required, proceed with normal login
                    const userInfo = {
                        email: userData.email,
                        full_name: userData.full_name,
                        token: data.token
                    };

                    setUser(userInfo);
                    setIsAuthenticated(true);
                    localStorage.setItem('user', JSON.stringify(userInfo));
                    localStorage.setItem('token', data.token.access);
                    localStorage.setItem('refresh_token', data.token.refresh);
                    scheduleTokenRefresh();

                    const result = {
                        success: true, 
                        message: data.message, 
                        user: userInfo,
                        email_verification_sent: data.email_verification_sent || false
                    };
                    
                    return result;
                }
            } else {
                const errorData = await response.json();
                return {success: false, message: errorData.message || 'Registration failed'};
            }
        } catch(error) {
            console.error('Registration error:', error);
            return {success: false, message: 'Network error occurred'};
        }
    };

    const refreshAccessToken = async () => {
        const refresh = localStorage.getItem('refresh_token');
        if(!refresh) {
            return false;
        }
        try {
            const response = await fetch(API_CONFIG.getFullUrl('AUTH', 'REFRESH'), {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({refresh})
            });
            
            if(response.ok) {
                const data = await response.json();
                if(data.access) {
                    localStorage.setItem('token', data.access);
                    // re-schedule next refresh
                    scheduleTokenRefresh();
                    return true;
                }
            } else {
                // refresh failed; force logout
                logout();
            }
        } catch(e) {
            console.error('Token refresh failed', e);
            logout();
        }
        return false;
    };

    const scheduleTokenRefresh = () => {
        if(refreshTimer) {
            clearTimeout(refreshTimer);
        }
        // Access token lifetime is 90 minutes; refresh 5 minutes before expiry
        const ms = (90 - 5) * 60 * 1000;
        const timer = setTimeout(() => {
            refreshAccessToken();
        }, ms);
        setRefreshTimer(timer);
    };

    // Check for existing user on app load
    React.useEffect(() => {
        const checkAuth = () => {
            const savedUser = localStorage.getItem('user');
            const token = localStorage.getItem('token');
            const refresh = localStorage.getItem('refresh_token');
            
            if(savedUser && token && refresh) {
                try {
                    const userData = JSON.parse(savedUser);
                    setUser(userData);
                    setIsAuthenticated(true);
                    scheduleTokenRefresh();
                } catch(error) {
                    console.error('AuthContext: Error parsing saved user data:', error);
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                    localStorage.removeItem('refresh_token');
                }
            }

            // Mark auth as initialized after the first check
            if(!isAuthReady) {
                setIsAuthReady(true);
            }
        };

        // Check immediately
        checkAuth();

        // Also check after a small delay to handle React StrictMode
        const timeoutId = setTimeout(checkAuth, 100);

        return () => clearTimeout(timeoutId);
    }, []);

    const value = {
        user,
        isAuthenticated,
        isAuthReady,
        login,
        logout,
        register
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if(!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
